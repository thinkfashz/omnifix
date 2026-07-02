import 'server-only';
import { getShopifyIntegrationCredentials } from '@/lib/shopifyIntegrationCredentials';

type ShopifyMoney = { amount: string; currencyCode: string };
type ShopifyImage = { url: string; altText?: string | null };
type ShopifyGraphQLError = { message: string };
type ShopifyGraphQLResponse<T> = { data?: T; errors?: ShopifyGraphQLError[] };

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  vendor?: string | null;
  productType?: string | null;
  tags?: string[];
  availableForSale: boolean;
  featuredImage?: ShopifyImage | null;
  collections?: { edges: Array<{ node: { id: string; title: string; handle?: string | null } }> };
  variants: { edges: Array<{ node: { id: string; title: string; sku?: string | null; availableForSale: boolean; quantityAvailable?: number | null; price: ShopifyMoney; compareAtPrice?: ShopifyMoney | null; image?: ShopifyImage | null } }> };
};

type CatalogResponse = { products: { edges: Array<{ node: ShopifyProductNode }> } };
type CartError = { field?: string[] | null; message: string };
type ShopifyCart = { id: string; checkoutUrl: string; totalQuantity: number; cost?: { subtotalAmount?: ShopifyMoney; totalAmount?: ShopifyMoney; totalTaxAmount?: ShopifyMoney | null } };
type CartCreateResponse = { cartCreate: { cart?: ShopifyCart | null; userErrors: CartError[] } };
type CartLinesAddResponse = { cartLinesAdd: { cart?: ShopifyCart | null; userErrors: CartError[] } };

export type ShopifyCartLineInput = { merchandiseId: string; quantity: number; attributes?: Array<{ key: string; value: string }> };
export type ShopifyBuyerIdentity = { email?: string; phone?: string };
export type OmnifixCatalogProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  image_url?: string;
  featured: boolean;
  activo: boolean;
  tagline?: string;
  rating?: number;
  delivery_days?: string;
  discount_percentage?: number;
  specifications?: Record<string, unknown>;
  category_id?: string;
  category_name?: string;
  source: 'shopify';
  source_url?: string;
  shopifyProductId: string;
  shopifyVariantId: string;
  shopifyHandle: string;
  availableForSale: boolean;
  currency: string;
};

const CATALOG_QUERY = `query OmnifixCatalog($first: Int!) { products(first: $first, sortKey: UPDATED_AT, reverse: true) { edges { node { id handle title description vendor productType tags availableForSale featuredImage { url altText } collections(first: 1) { edges { node { id title handle } } } variants(first: 1) { edges { node { id title sku availableForSale quantityAvailable price { amount currencyCode } compareAtPrice { amount currencyCode } image { url altText } } } } } } } }`;
const CART_CREATE = `mutation OmnifixCartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl totalQuantity } userErrors { field message } } }`;
const CART_LINES_ADD = `mutation OmnifixCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } totalTaxAmount { amount currencyCode } } } userErrors { field message } } }`;

function toNumber(value: string | number | null | undefined) {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function gidTail(value: string) {
  return value.split('/').filter(Boolean).pop() ?? value;
}

function assertCartErrors(errors: CartError[], context: string) {
  if (!errors?.length) return;
  throw new Error(`${context}: ${errors.map((e) => e.message).join(' | ')}`);
}

async function resolveCredentials() {
  const creds = await getShopifyIntegrationCredentials();
  if (!creds.shop_domain) throw new Error('Falta dominio Shopify. Conecta Shopify en /admin/integraciones/shopify.');
  if (!creds.storefront_access_token) throw new Error('Falta Storefront access token. Conecta Shopify en /admin/integraciones/shopify.');
  return creds;
}

async function graphQL<T>(kind: 'storefront' | 'admin', query: string, variables?: Record<string, unknown>): Promise<T> {
  const creds = await resolveCredentials();
  const endpoint = kind === 'storefront'
    ? `https://${creds.shop_domain}/api/${creds.api_version}/graphql.json`
    : `https://${creds.shop_domain}/admin/api/${creds.api_version}/graphql.json`;
  const token = kind === 'storefront' ? creds.storefront_access_token : creds.admin_api_token;
  if (!token) throw new Error(kind === 'admin' ? 'Falta Admin API token de Shopify.' : 'Falta Storefront token de Shopify.');
  const header = kind === 'storefront' ? 'X-Shopify-Storefront-Access-Token' : 'X-Shopify-Access-Token';
  const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', [header]: token }, body: JSON.stringify({ query, variables: variables ?? {} }), cache: 'no-store' });
  const json = (await res.json().catch(() => ({}))) as ShopifyGraphQLResponse<T>;
  if (!res.ok) throw new Error(`Shopify ${kind} API respondió ${res.status}.`);
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join(' | '));
  if (!json.data) throw new Error('Shopify no devolvió datos.');
  return json.data;
}

function mapProduct(node: ShopifyProductNode, domain: string): OmnifixCatalogProduct | null {
  const firstVariant = node.variants.edges[0]?.node;
  if (!firstVariant) return null;
  const price = toNumber(firstVariant.price.amount);
  const compareAt = toNumber(firstVariant.compareAtPrice?.amount);
  const collection = node.collections?.edges[0]?.node;
  const image = firstVariant.image?.url || node.featuredImage?.url || undefined;
  const tags = node.tags ?? [];
  return {
    id: node.handle || `shopify-${gidTail(node.id)}`,
    name: node.title,
    description: node.description || undefined,
    price,
    stock: firstVariant.availableForSale ? firstVariant.quantityAvailable ?? 999 : 0,
    image_url: image,
    featured: tags.some((tag) => /featured|destacado/i.test(tag)),
    activo: node.availableForSale,
    tagline: node.vendor || node.productType || 'Producto Shopify',
    discount_percentage: compareAt > price && price > 0 ? Math.round(((compareAt - price) / compareAt) * 100) : undefined,
    specifications: { shopify_handle: node.handle, shopify_product_id: node.id, shopify_variant_id: firstVariant.id, vendor: node.vendor || undefined, product_type: node.productType || undefined, sku: firstVariant.sku || undefined, tags },
    category_id: collection?.id,
    category_name: collection?.title || node.productType || undefined,
    source: 'shopify',
    source_url: `https://${domain}/products/${node.handle}`,
    shopifyProductId: node.id,
    shopifyVariantId: firstVariant.id,
    shopifyHandle: node.handle,
    availableForSale: node.availableForSale && firstVariant.availableForSale,
    currency: firstVariant.price.currencyCode,
  };
}

export async function isShopifyRuntimeConfigured() {
  const creds = await getShopifyIntegrationCredentials();
  return Boolean(creds.shop_domain && creds.storefront_access_token);
}

export async function getShopifyCatalogProducts(first = 200) {
  const creds = await resolveCredentials();
  const data = await graphQL<CatalogResponse>('storefront', CATALOG_QUERY, { first: Math.min(Math.max(first, 1), 250) });
  return data.products.edges.map((edge) => mapProduct(edge.node, creds.shop_domain)).filter((p): p is OmnifixCatalogProduct => Boolean(p));
}

export async function createShopifyCheckoutCart(options: { lines: ShopifyCartLineInput[]; buyerIdentity?: ShopifyBuyerIdentity }) {
  const lines = options.lines.map((line) => ({ merchandiseId: line.merchandiseId, quantity: Math.max(1, Math.min(Number(line.quantity || 1), 99)), ...(line.attributes?.length ? { attributes: line.attributes } : {}) })).filter((line) => line.merchandiseId && line.merchandiseId.startsWith('gid://shopify/ProductVariant/'));
  if (!lines.length) throw new Error('El carrito no contiene variantes válidas de Shopify.');
  const buyerIdentity = options.buyerIdentity?.email ? { email: options.buyerIdentity.email } : undefined;
  const created = await graphQL<CartCreateResponse>('storefront', CART_CREATE, { input: buyerIdentity ? { buyerIdentity } : {} });
  assertCartErrors(created.cartCreate.userErrors, 'Shopify no pudo crear el carrito');
  const cartId = created.cartCreate.cart?.id;
  if (!cartId) throw new Error('Shopify no devolvió carrito inicial.');
  const added = await graphQL<CartLinesAddResponse>('storefront', CART_LINES_ADD, { cartId, lines });
  assertCartErrors(added.cartLinesAdd.userErrors, 'Shopify no pudo agregar productos al carrito');
  if (!added.cartLinesAdd.cart?.checkoutUrl) throw new Error('Shopify no devolvió checkoutUrl.');
  return added.cartLinesAdd.cart;
}
