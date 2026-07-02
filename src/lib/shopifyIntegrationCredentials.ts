import 'server-only';
import { createClient } from '@insforge/sdk';
import { decryptCredentials } from '@/lib/integrationsCrypto';

export type ShopifyIntegrationCredentials = {
  shop_domain: string;
  storefront_access_token: string;
  admin_api_token: string;
  api_version: string;
  webhook_secret: string;
  source: 'env' | 'db' | 'mixed' | 'none';
};

export const SHOPIFY_PROVIDER = 'shopify';
export const DEFAULT_SHOPIFY_API_VERSION = '2026-07';

export function normalizeShopifyDomain(value: string) {
  return String(value || '')
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .trim()
    .toLowerCase();
}

function getInsforgeClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL ?? process.env.INSFORGE_URL;
  const anonKey = process.env.INSFORGE_API_KEY ?? process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  if (!baseUrl || !anonKey) return null;
  return createClient({ baseUrl, anonKey });
}

export function maskSecret(value: string) {
  if (!value) return '';
  if (value.length <= 4) return '••••';
  return `•••• ${value.slice(-4)}`;
}

export function envShopifyCredentials(): Partial<ShopifyIntegrationCredentials> {
  return {
    shop_domain: normalizeShopifyDomain(process.env.SHOPIFY_STORE_DOMAIN || ''),
    storefront_access_token: process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
    admin_api_token: process.env.SHOPIFY_ADMIN_API_TOKEN || '',
    api_version: process.env.SHOPIFY_API_VERSION || DEFAULT_SHOPIFY_API_VERSION,
    webhook_secret: process.env.SHOPIFY_WEBHOOK_SECRET || '',
  };
}

export async function dbShopifyCredentials(): Promise<Partial<ShopifyIntegrationCredentials>> {
  const client = getInsforgeClient();
  if (!client) return {};
  try {
    const { data } = await client.database
      .from('integrations')
      .select('credentials')
      .eq('provider', SHOPIFY_PROVIDER)
      .limit(1);
    if (!Array.isArray(data) || data.length === 0) return {};
    const raw = (data[0] as { credentials?: Record<string, unknown> }).credentials ?? {};
    const plain = decryptCredentials(raw) as Record<string, unknown>;
    return {
      shop_domain: normalizeShopifyDomain(String(plain.shop_domain || '')),
      storefront_access_token: String(plain.storefront_access_token || ''),
      admin_api_token: String(plain.admin_api_token || ''),
      api_version: String(plain.api_version || DEFAULT_SHOPIFY_API_VERSION),
      webhook_secret: String(plain.webhook_secret || ''),
    };
  } catch {
    return {};
  }
}

export async function getShopifyIntegrationCredentials(): Promise<ShopifyIntegrationCredentials> {
  const env = envShopifyCredentials();
  const db = await dbShopifyCredentials();
  const merged = {
    shop_domain: normalizeShopifyDomain(env.shop_domain || db.shop_domain || ''),
    storefront_access_token: env.storefront_access_token || db.storefront_access_token || '',
    admin_api_token: env.admin_api_token || db.admin_api_token || '',
    api_version: env.api_version || db.api_version || DEFAULT_SHOPIFY_API_VERSION,
    webhook_secret: env.webhook_secret || db.webhook_secret || '',
  };
  const envHas = Boolean(env.shop_domain || env.storefront_access_token || env.admin_api_token || env.webhook_secret);
  const dbHas = Boolean(db.shop_domain || db.storefront_access_token || db.admin_api_token || db.webhook_secret);
  return {
    ...merged,
    source: envHas && dbHas ? 'mixed' : envHas ? 'env' : dbHas ? 'db' : 'none',
  };
}

export function isShopifyCredentialSet(creds: Partial<ShopifyIntegrationCredentials>) {
  return Boolean(creds.shop_domain && creds.storefront_access_token);
}
