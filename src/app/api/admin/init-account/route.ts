import { NextResponse } from 'next/server';
import { insforge, insforgeAdmin } from '@/lib/insforge';
import {
  clearFailedAttempts,
  getClientIp,
  validateInitSecret,
} from '@/lib/adminAuth';

const INSFORGE_BASE = (
  process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://txv86efe.us-east.insforge.app'
).replace(/\/+$/, '');

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

type InitBody = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  initSecret?: string;
  fromForm?: boolean;
};

function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function normalizeName(value: unknown) {
  const name = String(value || '').trim();
  return name ? name.slice(0, 80) : 'Admin Omnifix';
}

function redirectSetup(request: Request, error: string) {
  const url = new URL('/admin/first-admin', request.url);
  url.searchParams.set('error', error.slice(0, 420));
  return NextResponse.redirect(url, { status: 303 });
}

function redirectLogin(request: Request, email: string) {
  const url = new URL('/admin/login', request.url);
  url.searchParams.set('setup', 'created');
  url.searchParams.set('email', email);
  return NextResponse.redirect(url, { status: 303 });
}

function fail(request: Request, fromForm: boolean, error: string, status = 400) {
  if (fromForm) return redirectSetup(request, error);
  return NextResponse.json({ error }, { status });
}

async function readInitBody(request: Request): Promise<InitBody> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    return {
      email: String(form.get('email') || ''),
      password: String(form.get('password') || ''),
      confirmPassword: String(form.get('confirmPassword') || ''),
      name: String(form.get('name') || ''),
      initSecret: String(form.get('initSecret') || ''),
      fromForm: true,
    };
  }
  try {
    return (await request.json()) as InitBody;
  } catch {
    return {};
  }
}

async function ensureAdminRowViaSql(email: string, name: string): Promise<boolean> {
  const apiKey = process.env.INSFORGE_API_KEY;
  if (!apiKey) return false;
  const safeEmail = email.replace(/'/g, "''");
  const safeName = name.replace(/'/g, "''");
  const query =
    `INSERT INTO public.admin_users (email, nombre, rol, aprobado, tenant_id) ` +
    `VALUES ('${safeEmail}', '${safeName}', 'superadmin', true, '${DEFAULT_TENANT_ID}') ` +
    `ON CONFLICT (email, tenant_id) DO UPDATE SET nombre = EXCLUDED.nombre, rol = 'superadmin', aprobado = true`;
  try {
    const res = await fetch(`${INSFORGE_BASE}/api/database/advance/rawsql/unrestricted`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function ensureAdminRowViaClient(email: string, name: string) {
  const tenantRow = {
    email,
    nombre: name,
    rol: 'superadmin',
    aprobado: true,
    tenant_id: DEFAULT_TENANT_ID,
  };

  const { error: tenantUpsertError } = await insforgeAdmin.database
    .from('admin_users')
    .upsert([tenantRow], { onConflict: 'email,tenant_id' });

  if (!tenantUpsertError) return { ok: true, method: 'client_tenant_upsert' };

  const legacyRow = {
    email,
    nombre: name,
    rol: 'superadmin',
    aprobado: true,
  };

  const { error: legacyUpsertError } = await insforgeAdmin.database
    .from('admin_users')
    .upsert([legacyRow], { onConflict: 'email' });

  if (!legacyUpsertError) {
    const { error: updateTenantError } = await insforgeAdmin.database
      .from('admin_users')
      .update({ tenant_id: DEFAULT_TENANT_ID, nombre: name, rol: 'superadmin', aprobado: true })
      .eq('email', email);
    if (!updateTenantError) return { ok: true, method: 'client_legacy_upsert_then_tenant_update' };
  }

  const rawSqlOk = await ensureAdminRowViaSql(email, name);
  if (rawSqlOk) return { ok: true, method: 'raw_sql_tenant_upsert' };

  return {
    ok: false,
    method: 'failed',
    error: tenantUpsertError?.message || legacyUpsertError?.message || 'No se pudo guardar admin_users.',
  };
}

async function verifyAdminRow(email: string) {
  const { data: tenantRows, error: tenantError } = await insforgeAdmin.database
    .from('admin_users')
    .select('email, rol, aprobado, tenant_id')
    .eq('email', email)
    .eq('tenant_id', DEFAULT_TENANT_ID)
    .limit(1);

  if (!tenantError && tenantRows && tenantRows.length > 0) {
    return { ok: true, row: tenantRows[0] as { email: string; rol?: string; aprobado?: boolean; tenant_id?: string | null } };
  }

  const { data: legacyRows, error: legacyError } = await insforgeAdmin.database
    .from('admin_users')
    .select('email, rol, aprobado, tenant_id')
    .eq('email', email)
    .limit(1);

  if (!legacyError && legacyRows && legacyRows.length > 0) {
    const row = legacyRows[0] as { email: string; rol?: string; aprobado?: boolean; tenant_id?: string | null };
    return { ok: row.aprobado === true && row.rol === 'superadmin' && row.tenant_id === DEFAULT_TENANT_ID, row };
  }

  return { ok: false, row: null };
}

export async function POST(request: Request) {
  const body = await readInitBody(request);
  const fromForm = body.fromForm === true;
  const expectedSecret = (process.env.ADMIN_INIT_SECRET ?? '').trim();
  const expectedInitialPassword = (process.env.ADMIN_INITIAL_PASSWORD ?? '').trim();
  const adminEmail = normalizeEmail(body.email || process.env.ADMIN_EMAIL);
  const initialPassword = String(body.password || process.env.ADMIN_INITIAL_PASSWORD || '').trim();
  const confirmPassword = String(body.confirmPassword || '').trim();
  const adminName = normalizeName(body.name);
  const activationSecrets = [expectedSecret, expectedInitialPassword].filter(Boolean);

  if (activationSecrets.length === 0 || !adminEmail || !initialPassword) {
    const missing: string[] = [];
    if (activationSecrets.length === 0) missing.push('ADMIN_INIT_SECRET o ADMIN_INITIAL_PASSWORD');
    if (!adminEmail) missing.push('email');
    if (!initialPassword) missing.push('password');
    return fail(
      request,
      fromForm,
      `Init no configurado. Faltan datos: ${missing.join(', ')}. Configura ADMIN_INIT_SECRET en Vercel y vuelve a desplegar.`,
      500
    );
  }

  if (!adminEmail.includes('@') || adminEmail.length < 6) {
    return fail(request, fromForm, 'Correo admin inválido.');
  }

  if (initialPassword.length < 8) {
    return fail(request, fromForm, 'La contraseña debe tener mínimo 8 caracteres.');
  }

  if (fromForm && confirmPassword && initialPassword !== confirmPassword) {
    return fail(request, true, 'Las claves no coinciden.');
  }

  const providedSecret = String(request.headers.get('x-admin-init-secret') || body.initSecret || '').trim();
  const activationOk = activationSecrets.some((secret) => validateInitSecret(providedSecret, secret));
  if (!activationOk) {
    return fail(
      request,
      fromForm,
      'No autorizado. La clave de activación no coincide. Debe ser exactamente ADMIN_INIT_SECRET de Vercel. Como respaldo temporal también sirve ADMIN_INITIAL_PASSWORD si todavía existe. Revisa mayúsculas, espacios y redeploy.',
      401
    );
  }

  const { data: signUpData, error: signUpError } = await insforge.auth.signUp({
    email: adminEmail,
    password: initialPassword,
    name: adminName,
  });

  const userAlreadyExists =
    signUpError &&
    (signUpError.message.toLowerCase().includes('already') ||
      signUpError.message.toLowerCase().includes('exists') ||
      signUpError.message.toLowerCase().includes('duplicate') ||
      signUpError.message.toLowerCase().includes('registrado') ||
      (signUpError.statusCode !== undefined && signUpError.statusCode === 409));

  if (signUpError && !userAlreadyExists) {
    return fail(request, fromForm, signUpError.message || 'Error al crear la cuenta.');
  }

  const saveResult = await ensureAdminRowViaClient(adminEmail, adminName);
  if (!saveResult.ok) {
    return fail(
      request,
      fromForm,
      `El usuario Auth se creó, pero no pude guardarlo como superadmin en admin_users. Revisa INSFORGE_API_KEY y la tabla admin_users. Detalle: ${saveResult.error || 'sin detalle'}`,
      500
    );
  }

  const verified = await verifyAdminRow(adminEmail);
  if (!verified.ok) {
    return fail(
      request,
      fromForm,
      'No pude verificar que el superadmin quedara guardado con tenant_id correcto. Revisa la columna tenant_id en admin_users.',
      500
    );
  }

  if (userAlreadyExists) {
    const message = 'La cuenta ya existe en InsForge Auth. La dejé guardada y aprobada como superadmin, pero la contraseña no se cambia desde este init. Usa la contraseña anterior de ese correo o crea otro correo nuevo.';
    if (fromForm) return redirectSetup(request, message);
    return NextResponse.json({ ok: false, alreadyExists: true, email: adminEmail, adminSaved: true, adminRow: verified.row, message });
  }

  await clearFailedAttempts(getClientIp(request));

  void signUpData;
  if (fromForm) return redirectLogin(request, adminEmail);
  return NextResponse.json({
    ok: true,
    email: adminEmail,
    adminSaved: true,
    adminRow: verified.row,
    saveMethod: saveResult.method,
    message:
      'Superadmin creado y guardado correctamente. Ya puedes iniciar sesión con el correo y la contraseña que acabas de escribir.',
  });
}
