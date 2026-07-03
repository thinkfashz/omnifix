'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Activity, ShieldCheck, UserPlus } from 'lucide-react';
import Omnifix3DTextLogo from '@/components/Omnifix3DTextLogo';

function BootSecurityScreen() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const started = Date.now();
    let raf = 0;
    const tick = () => {
      const value = Math.min(100, ((Date.now() - started) / 1200) * 100);
      setProgress(value);
      if (value < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.30),transparent_34rem),radial-gradient(circle_at_80%_90%,rgba(34,211,238,.14),transparent_28rem)]" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10 text-center">
        <Omnifix3DTextLogo text="Omnifix" showTagline />
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.34em] text-blue-200/70">Cargando admin</p>
        <div className="mt-5 h-1.5 w-60 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-300 to-cyan-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </main>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/75">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-14 w-full rounded-2xl border border-blue-300/15 bg-white/[0.055] px-5 text-sm font-semibold text-white outline-none placeholder:text-white/25 transition focus:border-blue-300/50 focus:bg-white/[0.08]" /></label>;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/me', { cache: 'no-store' });
        if (!cancelled && res.ok) {
          const json = (await res.json()) as { authenticated?: boolean };
          if (json.authenticated) { router.replace('/admin'); return; }
        }
      } catch {}
      if (!cancelled) setCheckingSession(false);
    })();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const setup = params.get('setup');
    const setupEmail = params.get('email');
    if (params.get('idle') === '1') setSuccess('Tu sesión se cerró automáticamente por inactividad.');
    if (setup === 'created') setSuccess('Superadmin creado y guardado correctamente. Ahora entra con la clave que acabas de crear.');
    if (setupEmail) setEmail(setupEmail);
  }, []);

  async function handleLogin() {
    setError(''); setSuccess(''); setLoading(true);
    try {
      const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim().toLowerCase(), password }) });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setError(json.error ?? 'Error al iniciar sesión.'); return; }
      router.replace('/admin');
    } catch { setError('Error de red. Inténtalo de nuevo.'); } finally { setLoading(false); }
  }

  if (checkingSession) return <BootSecurityScreen />;
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.30),transparent_34rem),radial-gradient(circle_at_80%_90%,rgba(34,211,238,.14),transparent_28rem)]" />
      <section className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-8 flex justify-center"><Omnifix3DTextLogo text="Omnifix" showTagline /></div>
        <div className="rounded-[2rem] border border-blue-300/15 bg-white/[0.07] p-6 shadow-[0_28px_90px_rgba(0,0,0,.42)] backdrop-blur-2xl sm:p-8">
          <div className="text-center"><ShieldCheck className="mx-auto h-8 w-8 text-blue-300" /><h1 className="mt-3 text-3xl font-black tracking-tight">Admin Omnifix</h1><p className="mt-2 text-sm text-slate-300">Acceso seguro al panel administrativo.</p></div>
          <div className="mt-6 space-y-5">
            <Field label="Correo admin" type="email" value={email} onChange={setEmail} placeholder="admin@email.com" />
            <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Tu contraseña" />
            {error && <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            {success && <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{success}</div>}
            <button type="button" onClick={() => void handleLogin()} disabled={loading} className="h-14 w-full rounded-full bg-blue-500 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_44px_rgba(37,99,235,.35)] transition hover:bg-white hover:text-blue-700 disabled:opacity-60">{loading ? 'Procesando...' : 'Entrar al admin'}</button>
            <Link href="/admin/first-admin" className="flex h-12 items-center justify-center gap-2 rounded-full border border-blue-300/15 bg-white/[0.055] text-xs font-black uppercase tracking-[0.16em] text-blue-100 transition hover:bg-white/[0.09]"><UserPlus className="h-4 w-4" /> Crear superadmin por primera vez</Link>
          </div>
        </div>
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[0.28em] text-slate-500"><Activity className="h-3 w-3" /> Omnifix · Panel seguro</p>
      </section>
    </main>
  );
}
