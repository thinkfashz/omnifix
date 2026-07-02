import { NextResponse } from 'next/server';
import { getShopifyCatalogProducts, isShopifyRuntimeConfigured } from '@/lib/shopifyRuntime';

export const runtime = 'nodejs';
export const revalidate = 60;

const CDN_CACHE = 'public, s-maxage=60, stale-while-revalidate=300';

function catalogResponse(payload: Record<string, unknown>, status = 200) {
  return NextResponse.json(payload, {
    status,
    headers: {
      'Cache-Control': status === 200 ? CDN_CACHE : 'no-store',
    },
  });
}

export async function GET() {
  try {
    if (!(await isShopifyRuntimeConfigured())) {
      return catalogResponse(
        {
          products: [],
          total: 0,
          source: 'shopify',
          error: 'Shopify no está configurado. Conecta Shopify en /admin/integraciones/shopify o define SHOPIFY_STORE_DOMAIN y SHOPIFY_STOREFRONT_ACCESS_TOKEN.',
        },
        503,
      );
    }

    const products = await getShopifyCatalogProducts(200);

    return catalogResponse({
      products,
      total: products.length,
      source: 'shopify',
      checkout: 'shopify',
      omnifix_role: 'Diseño, landing, campañas, consultas, CRM, IA y páginas personalizadas.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudieron cargar productos desde Shopify.';
    return catalogResponse({ products: [], total: 0, source: 'shopify', error: message }, 500);
  }
}
