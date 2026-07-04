import { createHmac, randomBytes } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, decodeSession } from '@/lib/adminAuth';
import { normalizeShopifyDomain } from '@/lib/shopifyIntegrationCredentials';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATE_COOKIE = 'shopify_oauth_state';
const DEFAULT_SCOPES = 'read_products,read_inventory,read_orders,write_orders,write_storefront_access_tokens,unauthenticated_read_product_listings,unauthenticated_read_checkouts,unauthenticated_write_checkouts';

function secret() {
  return process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET || process.env.ADMIN_SESSION_SECRET || '';
}

function clientId() {
  return process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_API_KEY || '';
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

async function requireSuperAdmin(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!cookie) return null;
  const session = await decodeSession(cookie);
  if (!session || session.rol !== 'superadmin') return null;
  return session;
}

export async function GET(request: NextRequest) {
  const session = await requireSuperAdmin(request);
  if (!session) return NextResponse.redirect(new URL('/admin/login', request.url));

  const id = clientId();
  if (!id || !secret()) {
    return NextResponse.redirect(new URL('/admin/integraciones/shopify?oauth=missing_env', request.url));
  }

  const shop = normalizeShopifyDomain(request.nextUrl.searchParams.get('shop') || '');
  if (!shop || !/^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i.test(shop)) {
    return NextResponse.redirect(new URL('/admin/integraciones/shopify?oauth=missing_shop', request.url));
  }

  const nonce = randomBytes(16).toString('hex');
  const payload = Buffer.from(JSON.stringify({ nonce, shop, ts: Date.now(), email: session.email })).toString('base64url');
  const state = `${payload}.${sign(payload)}`;
  const redirectUri = new URL('/api/admin/integrations/shopify/oauth/callback', request.url).toString();
  const scopes = process.env.SHOPIFY_OAUTH_SCOPES || DEFAULT_SCOPES;
  const url = new URL(`https://${shop}/admin/oauth/authorize`);
  url.searchParams.set('client_id', id);
  url.searchParams.set('scope', scopes);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', state);

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 600 });
  return res;
}
