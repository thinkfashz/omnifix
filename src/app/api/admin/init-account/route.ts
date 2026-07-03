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

type InitBody = {
  email?: string;
  password?: string;
  name?: string;
  initSecret?: string;
};

function normalizeEmail(value: unknown) {
  return String(value || '').trim().toLowerCase();
}

function normalizeName(value: unknown) {
  const name = String(value || '').trim();
  return name ? name.slice(0, 80) : 'Admin Omnifix';
}

async function readInitBody(request: Request): Promise<InitBody> {
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
    `INSERT INTO public.admin_users (email, nombre, rol, aprobado) ` +
    `VALUES ('${safeEmail}', '${safeName}', 'superadmin', true) ` +
    `ON CONFLICT (email) DO UPDATE SET nombre = EXCLUDED.nombre, rol = 'superadmin', aprobado = true`;
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

export async function POST(request: Request) {
  const body = await readInitBody(request);
  const expectedSecret = (process.env.ADMIN_INIT_SECRET ?? '').trim();
  const adminEmail = normalizeEmail(body.email || process.env.ADMIN_EMAIL);
  const initialPassword = String(body.password || process.env.ADMIN_INITIAL_PASSWORD || '').trim();
  const adminName = normalizeName(body.name);

  if (!expectedSecret || !adminEmail || !initialPassword) {
    const missing: string[] = [];
    if (!expectedSecret) missing.push('ADMIN_INIT_SECRET');
    if (!adminEmail) missing.push('email');
    if (!initialPassword) missing.push('password');
    return NextResponse.json(
      {
        error:
          `Init no configurado. Faltan datos: ${missing.join(', ')}. ` +
          'Configura ADMIN_INIT_SECRET en Vercel y usa /admin/setup para escribir el correo y la contraseña del nuevo superadmin.',
        code: 'INIT_NOT_CONFIGURED',
        missing,
      },
      { status: 500 }
    );
  }

  if (!adminEmail.includes('@') || adminEmail.length < 6) {
    return NextResponse.json({ error: 'Correo admin inválido.' }, { status: 400 });
  }

  if (initialPassword.length < 8) {
    return NextResponse.json({ error: 'La contraseña debe tener mínimo 8 caracteres.' }, { status: 400 });
  }

  const providedSecret = request.headers.get('x-admin-init-secret') || body.initSecret;
  if (!validateInitSecret(providedSecret, expectedSecret)) {
    return NextResponse.json(
      { error: 'No autorizado. El init secret no coincide.' },
      { status: 401 }
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
    return NextResponse.json(
      { error: signUpError.message || 'Error al crear la cuenta.' },
      { status: 400 }
    );
  }

  const bootstrapRow = {
    email: adminEmail,
    nombre: adminName,
    rol: 'superadmin',
    aprobado: true,
  };

  const { error: dbError } = await insforgeAdmin.database
    .from('admin_users')
    .upsert([bootstrapRow], { onConflict: 'email' });

  if (dbError) {
    const { error: insertError } = await insforgeAdmin.database
      .from('admin_users')
      .insert([bootstrapRow]);

    if (
      insertError &&
      !insertError.message.toLowerCase().includes('duplicate') &&
      !insertError.message.toLowerCase().includes('unique')
    ) {
      console.error('[AdminInit] DB error:', insertError);
    }

    const { error: approveError } = await insforgeAdmin.database
      .from('admin_users')
      .update({ nombre: adminName, aprobado: true, rol: 'superadmin' })
      .eq('email', adminEmail);
    if (approveError) {
      console.error('[AdminInit] failed to force-approve bootstrap admin:', approveError);
    }

    void ensureAdminRowViaSql(adminEmail, adminName);
  }

  if (userAlreadyExists) {
    return NextResponse.json({
      ok: false,
      alreadyExists: true,
      email: adminEmail,
      message:
        'La cuenta ya existe en InsForge. La dejé aprobada como superadmin, pero la contraseña no se puede cambiar desde este init. Usa otro correo nuevo o restablece esa contraseña en InsForge Auth.',
    });
  }

  await clearFailedAttempts(getClientIp(request));

  void signUpData;
  return NextResponse.json({
    ok: true,
    email: adminEmail,
    message:
      'Superadmin creado correctamente. Ya puedes iniciar sesión con el correo y la contraseña que acabas de escribir.',
  });
}
