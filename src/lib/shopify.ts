type ShopifyGraphQLError = {
  message: string;
  extensions?: Record<string, unknown>;
};

type ShopifyGraphQLResponse<T> = {
  data?: T;
  errors?: ShopifyGraphQLError[];
};

type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyImage = {
  url: string;
  altText?: string | null;
};

type ShopifyCollectionEdge = {
  node: {
    id: string;
    title: string;
    handle?: string | null;
  };
};

type ShopifyVariantEdge = {
  node: {
    id: string;
    title: string;
    sku?: string | null;
    availableForSale: boolean;
    quantityAvailable?: number | null;
    price: ShopifyMoney;
    compareAtPrice?: ShopifyMoney | null;
    image?: ShopifyImage | null;
  };
};

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  description?: string | null;
  descriptionHtml?: string | null;
  vendor?: string | null;
  productType?: string | null;
  tags?: string[];
  availableForSale: boolean;
  featuredImage?: ShopifyImage | null;
  collections?: { edges: ShopifyCollectionEdge[] };
  variants: { edges: ShopifyVariantEdge[] };
  updatedAt?: string;
};

type ShopifyCatalogResponse = {
  products: {
    edges: Array<{ node: ShopifyProductNode }>;
  };
};

type ShopifyCartUserError = {
  field?: string[] | null;
  message: string;
};

type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost?: {
    subtotalAmount?: ShopifyMoney;
    totalAmount?: ShopifyMoney;
    totalTaxAmount?: ShopifyMoney | null;
  };
};

type CartCreateResponse = {
  cartCreate: {
    cart?: ShopifyCart | null;
    userErrors: ShopifyCartUserError[];
  };
};

type CartLinesAddResponse = {
  cartLinesAdd: {
    cart?: ShopifyCart | null;
    userErrors: ShopifyCartUserError[];
  };
};

export type ShopifyCartLineInput = {
  merchandiseId: string;
  quantity: number;
  attributes?: Array<{ key: string; value: string }>;
};

export type ShopifyBuyerIdentity = {
  email?: string;
  phone?: string;
};

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

const DEFAULT_SHOPIFY_API_VERSION = '2026-07';
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || DEFAULT_SHOPIFY_API_VERSION;

const CATALOG_QUERY = /* GraphQL */ `
  query OmnifixCatalog($first: Int!) {
    products(first: $first, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          handle
          title
          description
          descriptionHtml
          vendor
          productType
          tags
          availableForSale
          updatedAt
          featuredImage {
            url
            altText
          }
          collections(first: 1) {
            edges {
              node {
                id
                title
                handle
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                title
                sku
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_CREATE_MUTATION = /* GraphQL */ `
  mutation OmnifixCartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  mutation OmnifixCartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        cost {
          subtotalAmount {
            amount
            currencyCode
          }
          totalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function normalizeShopDomain(value: string) {
  return value
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .trim();
}

function getShopifyStoreDomain() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error('Falta SHOPIFY_STORE_DOMAIN. Configura el dominio myshopify.com de tu tienda.');
  return normalizeShopDomain(domain);
}

function getStorefrontToken() {
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  if (!token) throw new Error('Falta SHOPIFY_STOREFRONT_ACCESS_TOKEN. Crea un Storefront API token en Shopify.');
  return token;
}

function getAdminToken() {
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;
  if (!token) throw new Error('Falta SHOPIFY_ADMIN_API_TOKEN. Crea un Admin API token en Shopify.');
  return token;
}

function shopifyEndpoint(api: 'storefront' | 'admin') {
  const domain = getShopifyStoreDomain();
  const apiPath = api === 'storefront' ? 'graphql.json' : 'graphql.json';
  return `https://${domain}/api/${SHOPIFY_API_VERSION}/${apiPath}`;
}

function adminEndpoint() {
  const domain = getShopifyStoreDomain();
  return `https://${domain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

async function shopifyGraphQL<T>(options: {
  api: 'storefront' | 'admin';
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const endpoint = options.api === 'storefront' ? shopifyEndpoint('storefront') : adminEndpoint();
  const token = options.api === 'storefront' ? getStorefrontToken() : getAdminToken();
  const tokenHeader = options.api === 'storefront' ? 'X-Shopify-Storefront-Access-Token' : 'X-Shopify-Access-Token';

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [tokenHeader]: token,
    },
    body: JSON.stringify({ query: options.query, variables: options.variables ?? {} }),
    cache: 'no-store',
  });

  const json = (await response.json().catch(() => ({}))) as ShopifyGraphQLResponse<T>;

  if (!response.ok) {
    throw new Error(`Shopify ${options.api} API respondió ${response.status}.`);
  }

  if (json.errors?.length) {
    throw new Error(json.errors.map((error) => error.message).join(' | '));
  }

  if (!json.data) {
    throw new Error('Shopify no devolvió datos.');
  }

  return json.data;
}

function assertNoCartUserErrors(userErrors: ShopifyCartUserError[], context: string) {
  if (!userErrors?.length) return;
  const details = userErrors.map((error) => error.message).join(' | ');
  throw new Error(`${context}: ${details}`);
}

function toNumber(value: string | number | null | undefined) {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function gidTail(value: string) {
  return value.split('/').filter(Boolean).pop() ?? value;
}

function buildShopifyProductUrl(handle: string) {
  try {
    return `https://${getShopifyStoreDomain()}/products/${handle}`;
  } catch {
    return undefined;
  }
}

function mapShopifyProduct(node: ShopifyProductNode): OmnifixCatalogProduct | null {
  const firstVariant = node.variants.edges[0]?.node;
  if (!firstVariant) return null;

  const image = firstVariant.image?.url || node.featuredImage?.url || undefined;
  const price = toNumber(firstVariant.price.amount);
  const compareAtPrice = toNumber(firstVariant.compareAtPrice?.amount);
  const hasDiscount = compareAtPrice > price && price > 0;
  const collection = node.collections?.edges[0]?.node;
  const stock = firstVariant.availableForSale ? firstVariant.quantityAvailable ?? 999 : 0;
  const tags = node.tags ?? [];

  return {
    id: node.handle || `shopify-${gidTail(node.id)}`,
    name: node.title,
    description: node.description || undefined,
    price,
    stock,
    image_url: image,
    featured: tags.some((tag) => /featured|destacado/i.test(tag)),
    activo: node.availableForSale,
    tagline: node.vendor || node.productType || 'Producto Shopify',
    rating: undefined,
    delivery_days: undefined,
    discount_percentage: hasDiscount ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : undefined,
    specifications: {
      shopify_handle: node.handle,
      shopify_product_id: node.id,
      shopify_variant_id: firstVariant.id,
      vendor: node.vendor || undefined,
      product_type: node.productType || undefined,
      sku: firstVariant.sku || undefined,
      tags,
    },
    category_id: collection?.id,
    category_name: collection?.title || node.productType || undefined,
    source: 'shopify',
    source_url: buildShopifyProductUrl(node.handle),
    shopifyProductId: node.id,
    shopifyVariantId: firstVariant.id,
    shopifyHandle: node.handle,
    availableForSale: node.availableForSale && firstVariant.availableForSale,
    currency: firstVariant.price.currencyCode,
  };
}

export function isShopifyConfigured() {
  return Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);
}

export async function storefrontRequest<T>(query: string, variables?: Record<string, unknown>) {
  return shopifyGraphQL<T>({ api: 'storefront', query, variables });
}

export async function adminRequest<T>(query: string, variables?: Record<string, unknown>) {
  return shopifyGraphQL<T>({ api: 'admin', query, variables });
}

export async function getShopifyCatalogProducts(first = 200): Promise<OmnifixCatalogProduct[]> {
  const data = await storefrontRequest<ShopifyCatalogResponse>(CATALOG_QUERY, {
    first: Math.min(Math.max(first, 1), 250),
  });

  return data.products.edges
    .map((edge) => mapShopifyProduct(edge.node))
    .filter((product): product is OmnifixCatalogProduct => Boolean(product));
}

export async function createShopifyCheckoutCart(options: {
  lines: ShopifyCartLineInput[];
  buyerIdentity?: ShopifyBuyerIdentity;
}) {
  const lines = options.lines
    .map((line) => ({
      merchandiseId: line.merchandiseId,
      quantity: Math.max(1, Math.min(Number(line.quantity || 1), 99)),
      ...(line.attributes?.length ? { attributes: line.attributes } : {}),
    }))
    .filter((line) => line.merchandiseId && line.merchandiseId.startsWith('gid://shopify/ProductVariant/'));

  if (!lines.length) {
    throw new Error('El carrito no contiene variantes válidas de Shopify.');
  }

  const buyerIdentity = options.buyerIdentity?.email
    ? { email: options.buyerIdentity.email }
    : undefined;

  const created = await storefrontRequest<CartCreateResponse>(CART_CREATE_MUTATION, {
    input: buyerIdentity ? { buyerIdentity } : {},
  });

  assertNoCartUserErrors(created.cartCreate.userErrors, 'Shopify cartCreate');

  const cartId = created.cartCreate.cart?.id;
  if (!cartId) throw new Error('Shopify no creó el carrito.');

  const updated = await storefrontRequest<CartLinesAddResponse>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines,
  });

  assertNoCartUserErrors(updated.cartLinesAdd.userErrors, 'Shopify cartLinesAdd');

  const cart = updated.cartLinesAdd.cart;
  if (!cart?.checkoutUrl) throw new Error('Shopify no devolvió checkoutUrl.');

  return cart;
}
