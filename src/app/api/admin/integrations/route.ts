import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@insforge/sdk';
import { ADMIN_COOKIE_NAME, decodeSession } from '@/lib/adminAuth';
import { serializeSdkError } from '@/lib/adminApi';
import {
  decryptCredentials,
  encryptCredentials,
  isEncryptionConfigured,
} from '@/lib/integrationsCrypto';
import {
  detectAllEnvCredentials,
  detectEnvProviderCredentials,
  envFieldPreview,
} from '@/lib/integrationsEnvMap';

export const dynamic = 'force-dynamic';

/**
 * Best-effort write to `integration_audit` (created in scripts/create-tables.sql).
 * Never throws — if the table doesn't exist yet, we just swallow the error.
 */
async function writeIntegrationAudit(
  client: ReturnType<typeof createClient>,
  request: NextRequest,
  session: { sub?: string; email?: string } | null,
  provider: string,
  action: 'create' | 'update' | 'delete',
  details: Record<string, unknown> = {},
): Promise<void> {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null;
    const ua = request.headers.get('user-agent') ?? null;
    await client.database.from('integration_audit').insert([
      {
        provider,
        action,
        actor: session?.email ?? session?.sub ?? null,
        ip,
        user_agent: ua,
        details,
      },
    ]);
  } catch {
    /* swallow — table may not exist yet */
  }
}

/**
 * Providers recognised by the admin integrations UI. Each provider stores a
 * free-form `credentials` JSON object in the InsForge `integrations` table so
 * new providers can be added without a schema migration.
 */
const ALLOWED_PROVIDERS = new Set([
  'shopify',      // Shopify catálogo, checkout, stock, órdenes y webhooks
  'meta',         // Facebook + Instagram + Meta Ads
  'google',       // Google OAuth / general Google APIs
  'google_ads',   // Google Ads API
  'tiktok',       // TikTok for Business / TikTok Ads
  'cloudinary',   // Cloudinary media storage
  'vercel',       // Vercel REST API (deployments + logs)
  'mercadolibre', // MercadoLibre listings, orders and questions
  'mercadopago',  // MercadoPago checkout / webhooks / health
  'stripe',       // Stripe payments / webhooks
  'whatsapp',     // WhatsApp Business Cloud API
  'resend',       // Resend transactional email
  'anthropic',    // Anthropic Claude API
  'groq',         // Groq LLaMA / Gemma (ultra-fast inference, plan gratuito)
  'openrouter',   // OpenRouter AI chat (gateway a múltiples LLMs)
  'openai',       // OpenAI ChatGPT (GPT-4o, GPT-4o-mini, o3)
  'gemini',       // Google Gemini (AI Studio — plan gratuito generoso)
  'grok',         // xAI Grok (API compatible con OpenAI, $25 crédito gratis)
  'serper',       // Serper.dev (Google SERP API gratis, módulo Inteligencia de Mercado)
  'serpapi',      // SerpAPI (Google SERP, plan pago futuro)
]);

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

/** Masks every credential value so we never echo secrets back to the client. */
function maskCredentials(credentials: Record<string, unknown> | null | undefined): Record<string, { set: boolean; preview: string; source?: 'db' | 'env'; envVar?: string }> {
  const out: Record<string, { set: boolean; preview: string; source?: 'db' | 'env'; envVar?: string }> = {};
  if (!credentials) return out;
  for (const [key, value] of Object.entries(credentials)) {
    if (typeof value !== 'string' || value.length === 0) {
      out[key] = { set: false, preview: '' };
      continue;
    }
    const preview = value.length <= 4 ? '•••' : `••• ${value.slice(-4)}`;
    out[key] = { set: true, preview };
  }
  return out;
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  const client = getClient();
  if (!client) return NextResponse.json({ error: 'InsForge no configurado en el servidor.' }, { status: 503 });

  try {
    const { data, error } = await client.database
      .from('integrations')
      .select('provider, credentials, updated_at');

    if (error) {
      const sdk = serializeSdkError(error);
      return NextResponse.json(
        {
          ...sdk,
          error: sdk.message,
          hint:
            sdk.hint ??
            'Crea la tabla `integrations` en InsForge (provider text PK, credentials jsonb, updated_at timestamptz).',
        },
        { status: 500 },
      );
    }

    const envCreds = detectAllEnvCredentials();

    type FieldStatus = { set: boolean; preview: string; source?: 'db' | 'env'; envVar?: string };
    const providers: Record<string, { credentials: Record<string, FieldStatus>; updated_at?: string; encrypted?: boolean; envManaged?: boolean }> = {};

    // Seed every known provider so env-only providers (no DB row yet) still
    // appear in the response with their env-sourced fields.
    for (const provider of ALLOWED_PROVIDERS) {
      providers[provider] = { credentials: {} };
    }

    for (const row of (data ?? []) as Array<{ provider?: string; credentials?: Record<string, unknown>; updated_at?: string }>) {
      if (!row.provider || !ALLOWED_PROVIDERS.has(row.provider)) continue;
      // Decrypt at-rest values before masking; if the row is plaintext
      // (legacy), `decryptCredentials` is a no-op on each field.
      const plain = decryptCredentials(row.credentials);
      const masked = maskCredentials(plain as Record<string, unknown>);
      for (const [field, info] of Object.entries(masked)) {
        if (info.set) info.source = 'db';
      }
      providers[row.provider] = {
        credentials: masked,
        updated_at: row.updated_at,
      };
    }

    // Merge env-resolved credentials *over* DB values: env wins (matches the
    // resolution order used by `getMercadoPagoCredentials`, `getMetaCredentials`,
    // `getVercelCredentials`, …) so the UI shows what the running server is
    // actually using and the admin can't accidentally enter a DB value that
    // would be ignored at runtime.
    for (const [provider, fields] of Object.entries(envCreds)) {
      if (!ALLOWED_PROVIDERS.has(provider)) continue;
      const entry = providers[provider] ?? (providers[provider] = { credentials: {} });
      for (const [field, detected] of Object.entries(fields)) {
        entry.credentials[field] = {
          set: true,
          preview: envFieldPreview(detected.value),
          source: 'env',
          envVar: detected.envName,
        };
      }
      // `envManaged` = "every configured field is supplied by env, and at
      // least one is". Unset fields are intentionally ignored (they don't
      // disqualify the badge — a provider can have only an `access_token`
      // in env with no other fields configured anywhere).
      const allEnv = Object.values(entry.credentials).every((v) => !v.set || v.source === 'env');
      const anyEnv = Object.values(entry.credentials).some((v) => v.source === 'env');
      entry.envManaged = anyEnv && allEnv;
    }

    return NextResponse.json({ providers, encrypted: isEncryptionConfigured() });
  } catch (err) {
    const sdk = serializeSdkError(err);
    return NextResponse.json({ ...sdk, error: sdk.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  const client = getClient();
  if (!client) return NextResponse.json({ error: 'InsForge no configurado en el servidor.' }, { status: 503 });

  let provider: string;
  let credentials: Record<string, string>;
  try {
    const body = await request.json();
    provider = String(body.provider ?? '').trim();
    credentials = (body.credentials ?? {}) as Record<string, string>;
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido.' }, { status: 400 });
  }

  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json({ error: 'Proveedor no permitido.' }, { status: 400 });
  }
  if (!credentials || typeof credentials !== 'object') {
    return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 400 });
  }

  // Refuse to overwrite fields that are already supplied by an environment
  // variable on the deployment (typically Vercel → Project Settings → Env).
  // The runtime helpers (`getVercelCredentials`, `getMercadoPagoCredentials`,
  // …) prefer env over DB, so persisting a different value here would be
  // silently ignored — that "conflict" is exactly what the admin asked us
  // to prevent. We surface the env var name so the operator knows where to
  // change the value.
  const envForProvider = detectEnvProviderCredentials(provider);
  const submittedConflicts = Object.entries(credentials)
    .filter(([key, value]) => typeof value === 'string' && value.trim().length > 0 && envForProvider[key])
    .map(([key]) => ({ field: key, envVar: envForProvider[key]!.envName }));
  if (submittedConflicts.length > 0) {
    const list = submittedConflicts.map((c) => `${c.field} (${c.envVar})`).join(', ');
    return NextResponse.json(
      {
        error: `Estos campos ya están definidos en variables de entorno (Vercel) y mandan sobre la base de datos: ${list}. Bórralos del formulario o actualiza el valor en Vercel → Project Settings → Environment Variables.`,
        code: 'ENV_VAR_PRESENT',
        envConflicts: submittedConflicts,
      },
      { status: 409 },
    );
  }

  // Cloudinary cloud names are lowercase alphanumerics with optional dashes /
  // underscores. Reject obvious mistakes (e.g. spaces or the literal "Root",
  // which is the default *Product Environment* label in Cloudinary's dashboard
  // — users frequently copy that instead of the actual cloud name).
  if (provider === 'cloudinary' && typeof credentials.cloud_name === 'string' && credentials.cloud_name.length > 0) {
    const candidate = credentials.cloud_name.trim();
    if (!/^[a-zA-Z0-9_-]+$/.test(candidate)) {
      return NextResponse.json(
        {
          error:
            'Cloud name inválido: sólo se permiten letras, números, guiones y guión bajo. No incluyas espacios ni la URL completa.',
        },
        { status: 400 },
      );
    }
    if (candidate.toLowerCase() === 'root') {
      return NextResponse.json(
        {
          error:
            '"Root" es el nombre del *Product Environment* de Cloudinary, no tu cloud name. Encuéntralo en cloudinary.com → Settings → API Keys (campo "Cloud Name") o en la URL del dashboard (cloudinary://...@TU_CLOUD_NAME).',
        },
        { status: 400 },
      );
    }
  }

  // Merge with existing credentials so the admin can update individual fields
  // (e.g. rotate only the access token) without having to re-enter everything.
  let existing: Record<string, string> = {};
  try {
    const { data } = await client.database
      .from('integrations')
      .select('credentials')
      .eq('provider', provider)
      .limit(1);
    if (Array.isArray(data) && data.length > 0) {
      const row = data[0] as { credentials?: Record<string, unknown> };
      // Decrypt before merging so live-validation calls below see plaintext
      // and the resulting persisted row contains the freshly re-encrypted
      // values.
      existing = decryptCredentials(row.credentials) as Record<string, string>;
    }
  } catch {
    // ignore — upsert below will recreate the row.
  }
  const isUpdate = Object.keys(existing).length > 0;

  const nextCredentials: Record<string, string> = { ...existing };
  for (const [key, value] of Object.entries(credentials)) {
    if (typeof value !== 'string') continue;
    if (value === '') continue; // empty string means "leave as-is"
    nextCredentials[key] = value.trim();
  }

  try {
    const encryptedToPersist = encryptCredentials(nextCredentials);
    const { error } = await client.database.from('integrations').upsert(
      [
        {
          provider,
          credentials: encryptedToPersist,
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'provider' },
    );
    if (error) {
      const sdk = serializeSdkError(error);
      return NextResponse.json(
        {
          ...sdk,
          error: sdk.message,
          hint:
            sdk.hint ??
            'Crea la tabla `integrations` en InsForge (provider text PK, credentials jsonb, updated_at timestamptz).',
        },
        { status: 500 },
      );
    }
    // Best-effort audit. Detail records *which* credential keys were
    // submitted in this POST (only string fields with non-empty trimmed
    // content, which is what the form actually edits). Boolean/number
    // fields aren't user-editable today; if that changes, widen the
    // filter so we capture every changed key, never the values.
    const changedKeys = Object.entries(credentials)
      .filter(([, v]) => typeof v === 'string' && v.trim().length > 0)
      .map(([k]) => k);
    void writeIntegrationAudit(client, request, session, provider, isUpdate ? 'update' : 'create', {
      keys: changedKeys,
      encrypted: isEncryptionConfigured(),
    });
    return NextResponse.json({
      ok: true,
      credentials: maskCredentials(nextCredentials),
      encrypted: isEncryptionConfigured(),
    });
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

  const url = new URL(request.url);
  const provider = url.searchParams.get('provider') ?? '';
  if (!ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json({ error: 'Proveedor no permitido.' }, { status: 400 });
  }

  try {
    const { error } = await client.database.from('integrations').delete().eq('provider', provider);
    if (error) {
      const sdk = serializeSdkError(error);
      return NextResponse.json({ ...sdk, error: sdk.message }, { status: 500 });
    }
    void writeIntegrationAudit(client, request, session, provider, 'delete', {});
    return NextResponse.json({ ok: true });
  } catch (err) {
    const sdk = serializeSdkError(err);
    return NextResponse.json({ ...sdk, error: sdk.message }, { status: 500 });
  }
}
