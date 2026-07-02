import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, decodeSession } from '@/lib/adminAuth';
import { getShopifyCatalogProducts } from '@/lib/shopifyRuntime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function requireAdmin(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) return null;
  return decodeSession(cookie.value);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  try {
    const products = await getShopifyCatalogProducts(50);
    return NextResponse.json({
      ok: true,
      provider: 'shopify',
      total: products.length,
      sample: products.slice(0, 8).map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category_name,
        variantId: product.shopifyVariantId,
      })),
      note: 'Preview de sincronización. Shopify manda en productos, precios, stock y checkout; Omnifix consume estos datos en la tienda pública.',
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, provider: 'shopify', error: err instanceof Error ? err.message : 'No se pudo sincronizar Shopify.' },
      { status: 500 },
    );
  }
}
