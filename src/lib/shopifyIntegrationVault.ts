import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, decodeSession, type AdminSessionPayload } from '@/lib/adminAuth';
import { insforgeAdmin } from '@/lib/insforge';

export const SHOPIFY_INTEGRATION_TABLE = 'shopify_integrations';
export const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
export const DEFAULT_SHOPIFY_API_VERSION = '2026-07';

export type ShopifyIntegrationStatus = {
  connected: boolean;
  shopDomain?: string | null;
  apiVersion?: string | null;
  status?: string | null;
  lastTestAt?: string | null;
  updatedAt?: string | null;
  hasStorefrontToken: boolean;
  hasAdminToken: boolean;
  hasWebhookSecret: boolean;
  tokenPreview?: {
    storefront?: string | null;
    admin?: string | null;
    webhook?: string | null;
  };
};

type AdminGuardResult =
  | { ok: true; session: AdminSessionPayload; tenantId: string }
  | { ok: false; status: number; error: string };

export function noStoreJsonHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'X-Content-Type-Options': 'nosniff',
  };
}

export function enforceHttps(request: NextRequest): { ok: true } | { ok: false; error: string; status: number } {
  if (process.env.NODE_ENV !== 'production') return { ok: true };
  const proto = request.headers.get('x-forwarded-proto') || request.nextUrl.protocol.replace(':', '');
  if (proto !== 'https') {
    return { ok: false, status: 426, error: 'Conexión insegura bloqueada. Usa HTTPS/TLS para administrar credenciales.' };
  }
  return { ok: true };
}

export async function requireSuperAdmin(request: NextRequest): Promise<AdminGuardResult> {
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (!sessionCookie?.value) return { ok: false, status: 401, error: 'No autenticado.' };
  const session = await decodeSession(sessionCookie.value);
  if (!session) return { ok: false, status: 401, error: 'Sesión inválida o expirada.' };
  if (session.rol !== 'superadmin') return { ok: false, status: 403, error: 'Solo superadmin puede administrar Shopify.' };
  return { ok: true, session, tenantId: session.tenant_id || DEFAULT_TENANT_ID };
}

function encryptionSecret() {
  const secret = process.env.SHOPIFY_CREDENTIALS_SECRET || process.env.ADMIN_PASSWORD_PEPPER || process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error('Falta SHOPIFY_CREDENTIALS_SECRET de mínimo 32 caracteres. Puedes usar ADMIN_PASSWORD_PEPPER como respaldo temporal.');
  }
  return secret.trim();
}

function encryptionKey() {
  return createHash('sha256').update(encryptionSecret(), 'utf8').digest();
}

export function encryptSecret(value: string) {
  const clear = value.trim();
  if (!clear) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(clear, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1.${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptSecret(value: string | null | undefined) {
  if (!value) return null;
  const [version, ivB64, tagB64, dataB64] = value.split('.');
  if (version !== 'v1' || !ivB64 || !tagB64 || !dataB64) throw new Error('Credencial cifrada inválida.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivB64, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(dataB64, 'base64url')), decipher.final()]).toString('utf8');
}

export function maskSecret(value: string | null | undefined) {
  if (!value) return null;
  const tail = value.slice(-4);
  return `••••${tail}`;
}

export function normalizeShopDomain(value: string) {
  return value
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .trim()
    .toLowerCase();
}

export function validateShopDomain(value: string) {
  const domain = normalizeShopDomain(value);
  if (!domain) throw new Error('Falta el dominio Shopify.');
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain) && !/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/.test(domain)) {
    throw new Error('Dominio Shopify inválido. Usa tu-tienda.myshopify.com o tu dominio de tienda.');
  }
  return domain;
}

export async function ensureShopifyIntegrationTable() {
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!apiKey) return { ok: false, error: 'Falta INSFORGE_API_KEY para crear/verificar la tabla de integraciones.' };
  const base = (process.env.NEXT_PUBLIC_INSFORGE_URL || '').replace(/\/+$/, '');
  if (!base) return { ok: false, error: 'Falta NEXT_PUBLIC_INSFORGE_URL.' };

  const query = `
    CREATE TABLE IF NOT EXISTS public.${SHOPIFY_INTEGRATION_TABLE} (
      tenant_id uuid PRIMARY KEY,
      provider text NOT NULL DEFAULT 'shopify',
      shop_domain text NOT NULL,
      storefront_token_enc text,
      admin_token_enc text,
      webhook_secret_enc text,
      api_version text NOT NULL DEFAULT '${DEFAULT_SHOPIFY_API_VERSION}',
      status text NOT NULL DEFAULT 'configured',
      scopes text[] DEFAULT ARRAY[]::text[],
      last_test_at timestamptz,
      updated_by text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS shopify_integrations_provider_idx ON public.${SHOPIFY_INTEGRATION_TABLE}(provider);
  `;

  try {
    const res = await fetch(`${base}/api/database/advance/rawsql/unrestricted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(10_000),
    });
    const text = await res.text().catch(() => '');
    if (!res.ok) return { ok: false, error: `No pude crear/verificar tabla Shopify. Status ${res.status}: ${text.slice(0, 260)}` };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function getShopifyIntegrationStatus(tenantId: string): Promise<ShopifyIntegrationStatus> {
  const { data, error } = await insforgeAdmin.database
    .from(SHOPIFY_INTEGRATION_TABLE)
    .select('shop_domain, storefront_token_enc, admin_token_enc, webhook_secret_enc, api_version, status, last_test_at, updated_at')
    .eq('tenant_id', tenantId)
    .limit(1);

  if (error || !data || data.length === 0) {
    return { connected: false, hasStorefrontToken: false, hasAdminToken: false, hasWebhookSecret: false };
  }

  const row = data[0] as Record<string, string | null>;
  return {
    connected: true,
    shopDomain: row.shop_domain,
    apiVersion: row.api_version,
    status: row.status,
    lastTestAt: row.last_test_at,
    updatedAt: row.updated_at,
    hasStorefrontToken: Boolean(row.storefront_token_enc),
    hasAdminToken: Boolean(row.admin_token_enc),
    hasWebhookSecret: Boolean(row.webhook_secret_enc),
    tokenPreview: {
      storefront: maskSecret(row.storefront_token_enc),
      admin: maskSecret(row.admin_token_enc),
      webhook: maskSecret(row.webhook_secret_enc),
    },
  };
}

export async function testShopifyConnection(input: { shopDomain: string; storefrontToken?: string | null; adminToken?: string | null; apiVersion?: string | null }) {
  const apiVersion = input.apiVersion || DEFAULT_SHOPIFY_API_VERSION;
  const shopDomain = validateShopDomain(input.shopDomain);
  const checks: Array<{ name: string; ok: boolean; detail: string }> = [];

  if (input.storefrontToken) {
    const res = await fetch(`https://${shopDomain}/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': input.storefrontToken },
      body: JSON.stringify({ query: '{ shop { name } }' }),
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    checks.push({ name: 'Storefront API', ok: res.ok, detail: res.ok ? 'Storefront respondió correctamente.' : `Storefront respondió ${res.status}.` });
  }

  if (input.adminToken) {
    const res = await fetch(`https://${shopDomain}/admin/api/${apiVersion}/shop.json`, {
      method: 'GET',
      headers: { 'X-Shopify-Access-Token': input.adminToken, Accept: 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
    });
    checks.push({ name: 'Admin API', ok: res.ok, detail: res.ok ? 'Admin API respondió correctamente.' : `Admin API respondió ${res.status}.` });
  }

  if (checks.length === 0) throw new Error('Agrega al menos Storefront token o Admin token para probar.');
  return { ok: checks.every((check) => check.ok), checks };
}

export function safeCompare(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
