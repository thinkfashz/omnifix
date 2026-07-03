'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ShieldCheck, UserPlus } from 'lucide-react';
import Omnifix3DTextLogo from '@/components/Omnifix3DTextLogo';

export default function FirstAdminPage() {
  const [setupKey, setSetupKey] = useState('');
  const [name, setName] = useState('Admin Omnifix');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit() {
    setMessage('');
    setError('');
    const cleanEmail = email.trim().toLowerCase();
    if (!setupKey.trim()) return setError('Falta la clave de activación.');
    if (!cleanEmail.includes('@')) return setError('Correo no válido.');
    if (pass.length < 8) return setError('La clave debe tener mínimo 8 caracteres.');
    if (pass !== pass2) return setError('Las claves no coinciden.');

    setLoading(true);
    try {
      const res = await fetch('/api/admin/init-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-init-secret': setupKey.trim(),
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: pass,
          name: name.trim() || 'Admin Omnifix',
          initSecret: setupKey.trim(),
        }),
      });
      const json = await res.json().catch(() => ({})) as { error?: string; message?: string; alreadyExists?: boolean; email?: string };
      if (!res.ok || json.error || json.alreadyExists) {
        setError(json.error || json.message || 'No se pudo crear el superadmin.');
        return;
      }
      setMessage(json.message || `Superadmin creado: ${cleanEmail}`);
      setPass('');
      setPass2('');
    } catch {
      setError('Error de red. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.30),transparent_34rem),radial-gradient(circle_at_80%_90%,rgba(34,211,238,.14),transparent_28rem)]" />
      <section className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg flex-col justify-center">
        <div className="mb-6 flex justify-center"><Omnifix3DTextLogo text="Omnifix" showTagline /></div>
        <div className="rounded-[2rem] border border-blue-300/15 bg-white/[0.07] p-6 shadow-[0_28px_90px_rgba(0,0,0,.42)] backdrop-blur-2xl sm:p-8">
          <div className="text-center">
            <UserPlus className="mx-auto h-9 w-9 text-blue-300" />
            <h1 className="mt-3 text-3xl font-black tracking-tight">Crear superadmin</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">Crea el primer acceso de Omnifix desde el celular, sin consola.</p>
          </div>
          <div className="mt-6 space-y-4">
            <Input label="Clave de activación" type="password" value={setupKey} onChange={setSetupKey} placeholder="Clave de activación" />
            <Input label="Nombre" value={name} onChange={setName} placeholder="Admin Omnifix" />
            <Input label="Correo nuevo" type="email" value={email} onChange={setEmail} placeholder="adminnuevo@omnifix.cl" />
            <div>
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/75">Clave nueva</span>
              <div className="flex h-14 items-center rounded-2xl border border-blue-300/15 bg-white/[0.055] px-5 focus-within:border-blue-300/50">
                <input type={show ? 'text' : 'password'} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mínimo 8 caracteres" className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/25" />
                <button type="button" onClick={() => setShow(!show)} className="ml-3 text-blue-100/70">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
              </div>
            </div>
            <Input label="Confirmar clave" type={show ? 'text' : 'password'} value={pass2} onChange={setPass2} placeholder="Repite la clave" />
            {error && <div className="rounded-2xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            {message && <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">{message}</div>}
            <button type="button" onClick={() => void submit()} disabled={loading} className="h-14 w-full rounded-full bg-blue-500 text-sm font-black uppercase tracking-[0.20em] text-white shadow-[0_18px_44px_rgba(37,99,235,.35)] transition hover:bg-white hover:text-blue-700 disabled:opacity-60">{loading ? 'Creando...' : 'Crear acceso'}</button>
            <Link href="/admin/login" className="flex h-12 items-center justify-center gap-2 rounded-full border border-blue-300/15 bg-white/[0.055] text-xs font-black uppercase tracking-[0.16em] text-blue-100"><ShieldCheck className="h-4 w-4" /> Ir al login</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Input({ label, type = 'text', value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block"><span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/75">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-14 w-full rounded-2xl border border-blue-300/15 bg-white/[0.055] px-5 text-sm font-semibold text-white outline-none placeholder:text-white/25 transition focus:border-blue-300/50" /></label>;
}
