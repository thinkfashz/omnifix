import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { insforgeAdmin } from '@/lib/insforge';
import { dispatchHookAsync } from '@/lib/extensionsBus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUPPORTED_TOPICS = new Set([
  'orders/create',
  'orders/paid',
  'products/update',
  'inventory_levels/update',
]);

type ShopifyOrderPayload = {
  id?: number | string;
  name?: string;
  order_number?: number | string;
  admin_graphql_api_id?: string;
  financial_status?: string;
  fulfillment_status?: string | null;
  currency?: string;
  current_subtotal_price?: string;
  current_total_tax?: string;
  current_total_price?: string;
  total_shipping_price_set?: { shop_money?: { amount?: string } };
  email?: string;
  contact_email?: string;
  phone?: string;
  created_at?: string;
  updated_at?: string;
  customer?: { first_name?: string; last_name?: string; email?: string; phone?: string };
  shipping_address?: {
    name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    country?: string;
    phone?: string;
  };
  line_items?: Array<{
    id?: number | string;
    product_id?: number | string;
    variant_id?: number | string;
    title?: string;
    name?: string;
    quantity?: number;
    price?: string;
    sku?: string;
  }>;
};

function safeNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function verifyShopifyHmac(rawBody: string, hmacHeader: string | null) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!hmacHeader) return false;

  const digest = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  const expected = Buffer.from(digest, 'utf8');
  const received = Buffer.from(hmacHeader, 'utf8');
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

function orderStatusFromTopic(topic: string, financialStatus?: string) {
  if (topic === 'orders/paid') return 'confirmado';
  if (financialStatus === 'paid') return 'confirmado';
  if (financialStatus === 'refunded' || financialStatus === 'voided') return 'cancelado';
  return 'pendiente_pago';
}

function customerName(payload: ShopifyOrderPayload) {
  const fromAddress = payload.shipping_address?.name;
  const fromCustomer = [payload.customer?.first_name, payload.customer?.last_name].filter(Boolean).join(' ');
  return fromAddress || fromCustomer || 'Cliente Shopify';
}

function shippingAddress(payload: ShopifyOrderPayload) {
  const address = payload.shipping_address;
  if (!address) return '';
  return [address.address1, address.address2, address.city, address.province, address.country]
    .filter(Boolean)
    .join(', ');
}

async function recordWebhook(topic: string, webhookId: string, payload: Record<string, unknown>) {
  try {
    await insforgeAdmin.database.from('payment_webhooks').insert([{
      idempotency_key: `shopify:${webhookId}`,
      event_type: `shopify.${topic}`,
      order_id: typeof payload.id === 'undefined' ? null : `SHOPIFY-${String(payload.id)}`,
      payment_id: typeof payload.admin_graphql_api_id === 'string' ? payload.admin_graphql_api_id : null,
      payment_status: typeof payload.financial_status === 'string' ? payload.financial_status : null,
      payload,
    }]);
  } catch {
    // Duplicate webhook IDs or missing optional table should not break Shopify retries.
  }
}

async function syncOrder(topic: string, payload: ShopifyOrderPayload) {
  if (!payload.id) return;

  const now = new Date().toISOString();
  const id = `SHOPIFY-${String(payload.id)}`;
  const status = orderStatusFromTopic(topic, payload.financial_status);
  const row = {
    id,
    customer_name: customerName(payload),
    customer_email: payload.email || payload.contact_email || payload.customer?.email || null,
    customer_phone: payload.phone || payload.customer?.phone || payload.shipping_address?.phone || null,
    region: payload.shipping_address?.province || null,
    shipping_address: shippingAddress(payload),
    items: payload.line_items ?? [],
    subtotal: safeNumber(payload.current_subtotal_price),
    tax: safeNumber(payload.current_total_tax),
    shipping_fee: safeNumber(payload.total_shipping_price_set?.shop_money?.amount),
    total: safeNumber(payload.current_total_price),
    currency: payload.currency || 'CLP',
    status,
    payment_id: payload.admin_graphql_api_id || null,
    payment_status: payload.financial_status || null,
    created_at: payload.created_at || now,
    updated_at: payload.updated_at || now,
  };

  try {
    const { data } = await insforgeAdmin.database.from('orders').select('id').eq('id', id).limit(1);
    if (Array.isArray(data) && data.length > 0) {
      await insforgeAdmin.database.from('orders').update({
        status: row.status,
        payment_status: row.payment_status,
        total: row.total,
        currency: row.currency,
        updated_at: row.updated_at,
      }).eq('id', id);
    } else {
      await insforgeAdmin.database.from('orders').insert([row]);
    }
  } catch {
    // Keep webhook response successful; Shopify will retry aggressively on 5xx.
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const topic = request.headers.get('x-shopify-topic') || 'unknown';
  const webhookId = request.headers.get('x-shopify-webhook-id') || `${topic}:${Date.now()}`;
  const hmac = request.headers.get('x-shopify-hmac-sha256');

  if (!verifyShopifyHmac(rawBody, hmac)) {
    return NextResponse.json({ ok: false, error: 'Webhook Shopify inválido.' }, { status: 401 });
  }

  if (!SUPPORTED_TOPICS.has(topic)) {
    return NextResponse.json({ ok: true, ignored: true, topic });
  }

  const payload = JSON.parse(rawBody || '{}') as Record<string, unknown>;
  await recordWebhook(topic, webhookId, payload);

  if (topic === 'orders/create' || topic === 'orders/paid') {
    await syncOrder(topic, payload as ShopifyOrderPayload);
  }

  dispatchHookAsync('shopify.webhook', { topic, webhookId, payload });

  return NextResponse.json({ ok: true, topic, webhookId });
}
