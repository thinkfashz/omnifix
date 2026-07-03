import Link from 'next/link';
import { ShieldCheck, UserPlus } from 'lucide-react';
import Omnifix3DTextLogo from '@/components/Omnifix3DTextLogo';

type FirstAdminSearchParams = Promise<{
  error?: string | string[];
  email?: string | string[];
}>;

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FirstAdminPage({ searchParams }: { searchParams: FirstAdminSearchParams }) {
  const params = await searchParams;
  const error = one(params.error);
  const email = one(params.email) || '';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.30),transparent_34rem),radial-gradient(circle_at_80%_90%,rgba(34,211,238,.14),transparent_28rem)]" />
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg flex-col justify-center">
        <div className="mb-6 flex justify-center"><Omnifix3DTextLogo text="Omnifix" showTagline /></div>
        <form method="post" action="/api/admin/init-account" className="rounded-[2rem] border border-blue-300/15 bg-white/[0.07] p-6 shadow-[0_28px_90px_rgba(0,0,0,.42)] backdrop-blur-2xl sm:p-8">
          <div className="text-center">
            <UserPlus className="mx-auto h-9 w-9 text-blue-300" />
            <h1 className="mt-3 text-3xl font-black tracking-tight">Crear superadmin</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">Formulario nativo: el botón envía directo al servidor y guarda el usuario en InsForge.</p>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-300/15 bg-blue-400/10 px-4 py-3 text-xs leading-6 text-blue-100/85">
            Usa un correo nuevo que no exista en InsForge Auth. La clave de activación es tu <b>ADMIN_INIT_SECRET</b> de Vercel.
          </div>

          <div className="mt-6 space-y-4">
            <Input name="initSecret" label="Clave de activación" type="password" placeholder="ADMIN_INIT_SECRET" autoComplete="one-time-code" required />
            <Input name="name" label="Nombre" defaultValue="Admin Omnifix" placeholder="Admin Omnifix" autoComplete="name" required />
            <Input name="email" label="Correo nuevo" type="email" defaultValue={email} placeholder="adminnuevo@omnifix.cl" autoComplete="email" required />
            <Input name="password" label="Clave nueva" type="password" placeholder="Mínimo 8 caracteres" autoComplete="new-password" minLength={8} required />
            <Input name="confirmPassword" label="Confirmar clave" type="password" placeholder="Repite la clave" autoComplete="new-password" minLength={8} required />

            {error ? <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm leading-6 text-rose-200">{error}</div> : null}

            <button type="submit" className="h-14 w-full rounded-full bg-blue-500 text-sm font-black uppercase tracking-[0.20em] text-white shadow-[0_18px_44px_rgba(37,99,235,.35)] transition hover:bg-white hover:text-blue-700">
              Crear acceso
            </button>

            <p className="text-center text-[11px] leading-5 text-slate-400">Este botón no depende de JavaScript. Si hay error, vuelve a esta pantalla con el mensaje exacto.</p>
            <Link href="/admin/login" className="flex h-12 items-center justify-center gap-2 rounded-full border border-blue-300/15 bg-white/[0.055] text-xs font-black uppercase tracking-[0.16em] text-blue-100"><ShieldCheck className="h-4 w-4" /> Ir al login</Link>
          </div>
        </form>
      </section>
    </main>
  );
}

function Input({ name, label, type = 'text', placeholder, defaultValue, autoComplete, minLength, required }: { name: string; label: string; type?: string; placeholder: string; defaultValue?: string; autoComplete?: string; minLength?: number; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/75">{label}</span>
      <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} autoComplete={autoComplete} minLength={minLength} required={required} className="h-14 w-full rounded-2xl border border-blue-300/15 bg-white/[0.055] px-5 text-sm font-semibold text-white outline-none placeholder:text-white/25 transition focus:border-blue-300/50" />
    </label>
  );
}
