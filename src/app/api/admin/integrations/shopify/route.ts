import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@insforge/sdk';
import { ADMIN_COOKIE_NAME, decodeSession } from '@/lib/adminAuth';
import { serializeSdkError } from '@/lib/adminApi';
import { decryptCredentials, encryptCredentials, isEncryptionConfigured } from '@/lib/integrationsCrypto';
import {
  DEFAULT_SHOPIFY_API_VERSION,
  SHOPIFY_PROVIDER,
  envShopifyCredentials,
  getShopifyIntegrationCredentials,
  maskSecret,
  normalizeShopifyDomain,
  type ShopifyIntegrationCredentials,
} from '@/lib/shopifyIntegrationCredentials';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Check = { name: string; ok: boolean; detail?: string };

function getClient() {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL ?? process.env.INSFORGE_URL;
  const anonKey = process.env.INSFORGE_API_KEY ?? process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  if (!baseUrl || !anonKey) return null;
  return createClient({ baseUrl, anonKey });
}

async function requireAdmin(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);
  if (!sessionCookie?.value) return null;
  return decodeSession(sessionCookie.value);
}

function cleanCredentialPayload(input: Record<string, unknown>): Partial<ShopifyIntegrationCredentials> {
  return {
    shop_domain: normalizeShopifyDomain(String(input.shop_domain || input.shopDomain || '')),
    storefront_access_token: String(input.storefront_access_token || input.storefrontToken || '').trim(),
    admin_api_token: String(input.admin_api_token || input.adminToken || '').trim(),
    api_version: String(input.api_version || input.apiVersion || DEFAULT_SHOPIFY_API_VERSION).trim() || DEFAULT_SHOPIFY_API_VERSION,
    webhook_secret: String(input.webhook_secret || input.webhookSecret || '').trim(),
  };
}

function preview(creds: Partial<ShopifyIntegrationCredentials>) {
  return {
    shop_domain: creds.shop_domain || '',
    storefront_access_token: maskSecret(creds.storefront_access_token || ''),
    admin_api_token: maskSecret(creds.admin_api_token || ''),
    api_version: creds.api_version || DEFAULT_SHOPIFY_API_VERSION,
    webhook_secret: maskSecret(creds.webhook_secret || ''),
  };
}

async function readDbCredentials() {
  const client = getClient();
  if (!client) return {} as Partial<ShopifyIntegrationCredentials>;
  try {
    const { data } = await client.database
      .from('integrations')
      .select('credentials')
      .eq('provider', SHOPIFY_PROVIDER)
      .limit(1);
    if (!Array.isArray(data) || data.length === 0) return {};
    const raw = (data[0] as { credentials?: Record<string, unknown> }).credentials ?? {};
    return decryptCredentials(raw) as Partial<ShopifyIntegrationCredentials>;
  } catch {
    return {};
  }
}

async function shopifyGraphQL(options: {
  domain: string;
  apiVersion: string;
  token: string;
  kind: 'storefront' | 'admin';
  query: string;
}) {
  const endpoint = options.kind === 'storefront'
    ? `https://${options.domain}/api/${options.apiVersion}/graphql.json`
    : `https://${options.domain}/admin/api/${options.apiVersion}/graphql.json`;
  const tokenHeader = options.kind === 'storefront' ? 'X-Shopify-Storefront-Access-Token' : 'X-Shopify-Access-Token';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [tokenHeader]: options.token,
    },
    body: JSON.stringify({ query: options.query }),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({})) as { data?: unknown; errors?: Array<{ message?: string }> };
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message || 'GraphQL error').join(' | '));
  return json;
}

async function runShopifyChecks(creds: ShopifyIntegrationCredentials) {
  const checks: Check[] = [];
  const domain = normalizeShopifyDomain(creds.shop_domain);
  const apiVersion = creds.api_version || DEFAULT_SHOPIFY_API_VERSION;

  if (!domain) checks.push({ name: 'Dominio Shopify', ok: false, detail: 'Falta shop_domain.' });
  else if (!/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) checks.push({ name: 'Dominio Shopify', ok: false, detail: 'Formato inválido. Usa tu-tienda.myshopify.com.' });
  else checks.push({ name: 'Dominio Shopify', ok: true, detail: domain });

  if (!creds.storefront_access_token) checks.push({ name: 'Storefront token', ok: false, detail: 'Falta para catálogo y checkout público.' });
  if (!creds.admin_api_token) checks.push({ name: 'Admin API token', ok: false, detail: 'Falta para sincronización, órdenes y administración.' });

  if (domain && creds.storefront_access_token) {
    try {
      const json = await shopifyGraphQL({
        domain,
        apiVersion,
        token: creds.storefront_access_token,
        kind: 'storefront',
        query: 'query { shop { name } products(first: 1) { edges { node { title handle } } } }',
      }) as { data?: { shop?: { name?: string }; products?: { edges?: unknown[] } } };
      checks.push({ name: 'Storefront API', ok: true, detail: `Conectado a ${json.data?.shop?.name || domain}. Productos accesibles: ${json.data?.products?.edges?.length ?? 0}.` });
    } catch (err) {
      checks.push({ name: 'Storefront API', ok: false, detail: err instanceof Error ? err.message : String(err) });
    }
  }

  if (domain && creds.admin_api_token) {
    try {
      const json = await shopifyGraphQL({
        domain,
        apiVersion,
        token: creds.admin_api_token,
        kind: 'admin',
        query: 'query { shop { name myshopifyDomain } }',
      }) as { data?: { shop?: { name?: string; myshopifyDomain?: string } } };
      checks.push({ name: 'Admin API', ok: true, detail: `Admin conectado: ${json.data?.shop?.name || domain} · ${json.data?.shop?.myshopifyDomain || domain}.` });
    } catch (err) {
      checks.push({ name: 'Admin API', ok: false, detail: err instanceof Error ? err.message : String(err) });
    }
  }

  if (!creds.webhook_secret) checks.push({ name: 'Webhook secret', ok: false, detail: 'Opcional para guardar, recomendado antes de activar webhooks en producción.' });
  else checks.push({ name: 'Webhook secret', ok: true, detail: 'Configurado para validar HMAC de Shopify.' });

  return {
    ok: checks.some((c) => c.name === 'Storefront API' && c.ok) && checks.some((c) => c.name === 'Admin API' && c.ok),
    checks,
  };
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const merged = await getShopifyIntegrationCredentials();
  const env = envShopifyCredentials();
  const db = await readDbCredentials();
  return NextResponse.json({
    ok: true,
    provider: SHOPIFY_PROVIDER,
    source: merged.source,
    encrypted: isEncryptionConfigured(),
    configured: Boolean(merged.shop_domain && merged.storefront_access_token),
    credentials: preview(merged),
    env: preview(env),
    db: preview(db),
    requiredEnvFallbacks: ['SHOPIFY_STORE_DOMAIN', 'SHOPIFY_STOREFRONT_ACCESS_TOKEN', 'SHOPIFY_ADMIN_API_TOKEN', 'SHOPIFY_API_VERSION', 'SHOPIFY_WEBHOOK_SECRET'],
  });
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const client = getClient();
  if (!client) return NextResponse.json({ error: 'InsForge no configurado en el servidor.' }, { status: 503 });

  try {
    const body = await request.json().catch(() => ({}));
    const action = String(body.action || 'save');
    const existing = await readDbCredentials();
    const submitted = cleanCredentialPayload(body.credentials || body);
    const next: ShopifyIntegrationCredentials = {
      shop_domain: normalizeShopifyDomain(submitted.shop_domain || existing.shop_domain || ''),
      storefront_access_token: submitted.storefront_access_token || existing.storefront_access_token || '',
      admin_api_token: submitted.admin_api_token || existing.admin_api_token || '',
      api_version: submitted.api_version || existing.api_version || DEFAULT_SHOPIFY_API_VERSION,
      webhook_secret: submitted.webhook_secret || existing.webhook_secret || '',
      source: 'db',
    };

    const test = await runShopifyChecks(next);
    if (action === 'test') {
      return NextResponse.json({ provider: SHOPIFY_PROVIDER, ...test, credentials: preview(next) });
    }

    if (!next.shop_domain) return NextResponse.json({ error: 'Falta shop_domain.' }, { status: 400 });
    if (!next.storefront_access_token) return NextResponse.json({ error: 'Falta storefront_access_token.' }, { status: 400 });

    const { error } = await client.database.from('integrations').upsert([
      {
        provider: SHOPIFY_PROVIDER,
        credentials: encryptCredentials(next),
        updated_at: new Date().toISOString(),
      },
    ], { onConflict: 'provider' });

    if (error) {
      const sdk = serializeSdkError(error);
      return NextResponse.json({ ...sdk, error: sdk.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, provider: SHOPIFY_PROVIDER, credentials: preview(next), test, encrypted: isEncryptionConfigured() });
  } catch (err) {
    const sdk = serializeSdkError(err);
    return NextResponse.json({ ...sdk, error: sdk.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const client = getClient();
  if (!client) return NextResponse.json({ error: 'InsForge no configurado en el servidor.' }, { status: 503 });
  try {
    const { error } = await client.database.from('integrations').delete().eq('provider', SHOPIFY_PROVIDER);
    if (error) {
      const sdk = serializeSdkError(error);
      return NextResponse.json({ ...sdk, error: sdk.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, provider: SHOPIFY_PROVIDER });
  } catch (err) {
    const sdk = serializeSdkError(err);
    return NextResponse.json({ ...sdk, error: sdk.message }, { status: 500 });
  }
}
