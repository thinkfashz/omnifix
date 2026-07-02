import { NextResponse } from 'next/server';
import { createShopifyCheckoutCart, isShopifyRuntimeConfigured, type ShopifyCartLineInput } from '@/lib/shopifyRuntime';
import { getClientIp } from '@/lib/adminAuth';
import { checkPersistentRateLimit } from '@/lib/adminRateLimitStore';
import { campaignBusyHeaders, getCampaignMode, publicCheckoutEnabled } from '@/lib/campaignMode';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_MAX = 12;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

type CheckoutBody = {
  items?: Array<{
    productoId?: string;
    merchandiseId?: string;
    shopifyVariantId?: string;
    variantId?: string;
    cantidad?: number;
    quantity?: number;
    nombre?: string;
  }>;
  cliente?: {
    nombre?: string;
    email?: string;
    telefono?: string;
  };
  region?: string;
  shippingAddress?: string;
};

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

async function readCheckoutBody(request: Request): Promise<CheckoutBody | null> {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) return null;
  const text = await request.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) return null;
  return JSON.parse(text) as CheckoutBody;
}

function getVariantId(item: NonNullable<CheckoutBody['items']>[number]) {
  const candidates = [item.shopifyVariantId, item.merchandiseId, item.variantId, item.productoId];
  return candidates.find((value) => typeof value === 'string' && value.startsWith('gid://shopify/ProductVariant/')) || '';
}

function mapItemsToShopifyLines(items: CheckoutBody['items']): ShopifyCartLineInput[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => {
      const merchandiseId = getVariantId(item);
      const quantity = Math.max(1, Math.min(Number(item.cantidad ?? item.quantity ?? 1), 99));
      return {
        merchandiseId,
        quantity,
        attributes: item.nombre ? [{ key: 'Producto Omnifix', value: cleanText(item.nombre, 120) }] : undefined,
      } satisfies ShopifyCartLineInput;
    })
    .filter((line) => Boolean(line.merchandiseId));
}

export async function POST(request: Request) {
  try {
    if (!publicCheckoutEnabled()) {
      return NextResponse.json(
        {
          error: 'Checkout pausado temporalmente por modo campaña. Puedes guardar el producto o contactarnos por WhatsApp.',
          campaignMode: getCampaignMode(),
        },
        { status: 503, headers: campaignBusyHeaders() },
      );
    }

    if (!(await isShopifyRuntimeConfigured())) {
      return NextResponse.json(
        { error: 'Shopify checkout no está configurado. Conecta Shopify en /admin/integraciones/shopify o define SHOPIFY_STORE_DOMAIN y SHOPIFY_STOREFRONT_ACCESS_TOKEN.' },
        { status: 503 },
      );
    }

    const ip = getClientIp(request);
    const rl = await checkPersistentRateLimit({
      namespace: 'public:checkout-shopify',
      identity: ip,
      max: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Demasiados intentos de checkout. Intenta nuevamente en unos minutos.', retry_after: rl.retryAfterSec },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
      );
    }

    const body = await readCheckoutBody(request);
    if (!body) return NextResponse.json({ error: 'Solicitud demasiado grande.' }, { status: 413 });

    const lines = mapItemsToShopifyLines(body.items);
    if (!lines.length) {
      return NextResponse.json(
        { error: 'Los productos del carrito no tienen variantes válidas de Shopify. Recarga la tienda y agrega nuevamente los productos.' },
        { status: 422 },
      );
    }

    const email = cleanText(body.cliente?.email, 180).toLowerCase();
    const cart = await createShopifyCheckoutCart({
      lines,
      buyerIdentity: email ? { email } : undefined,
    });

    const subtotal = Number(cart.cost?.subtotalAmount?.amount ?? 0);
    const total = Number(cart.cost?.totalAmount?.amount ?? subtotal);
    const tax = Number(cart.cost?.totalTaxAmount?.amount ?? 0);
    const currency = cart.cost?.totalAmount?.currencyCode ?? cart.cost?.subtotalAmount?.currencyCode ?? 'CLP';

    return NextResponse.json(
      {
        data: {
          id: cart.id,
          estado: 'shopify_checkout',
          paymentMethod: 'shopify',
          trackingUrl: cart.checkoutUrl,
          deliveryEstimate: 'Confirmado por Shopify durante el checkout',
          resumen: {
            subtotal,
            iva: tax,
            despacho: 0,
            total,
            moneda: currency,
          },
        },
        persistence: 'shopify',
        payment: {
          provider: 'shopify',
          method: 'shopify_checkout',
          checkoutUrl: cart.checkoutUrl,
          cartId: cart.id,
        },
        notification: {
          ok: true,
          deferred: true,
          reason: 'La orden se guarda en Omnifix cuando Shopify envíe el webhook orders/create u orders/paid.',
        },
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno al crear checkout Shopify.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
