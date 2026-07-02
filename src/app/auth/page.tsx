'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { insforge } from '@/lib/insforge';
import Omnifix3DTextLogo from '@/components/Omnifix3DTextLogo';

type Screen = 'login' | 'register' | 'verify' | 'reset-send' | 'reset-code' | 'reset-password';

const IconGoogle = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

function Field({ label, type = 'text', value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/80">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-14 w-full rounded-2xl border border-blue-300/15 bg-white/[0.055] px-5 text-sm font-semibold text-white outline-none placeholder:text-white/25 transition focus:border-blue-300/50 focus:bg-white/[0.08] focus:shadow-[0_0_0_4px_rgba(37,99,235,.12)]"
      />
    </label>
  );
}

function Notice({ text, kind = 'error' }: { text: string; kind?: 'error' | 'success' }) {
  if (!text) return null;
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 ${kind === 'success' ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/25 bg-rose-500/10 text-rose-200'}`}>{text}</div>;
}

function PrimaryButton({ children, loading, onClick }: { children: React.ReactNode; loading?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} disabled={loading} className="h-14 w-full rounded-full bg-blue-500 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_18px_44px_rgba(37,99,235,.35)] transition hover:bg-white hover:text-blue-700 disabled:opacity-60">
      {loading ? 'Procesando...' : children}
    </button>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') setScreen('register');
  }, []);

  const reset = () => { setError(''); setSuccess(''); };

  async function handleRegister() {
    reset(); setLoading(true);
    const { data, error: err } = await insforge.auth.signUp({ email, password, name, redirectTo: `${window.location.origin}/auth` });
    setLoading(false);
    if (err) { setError(err.message); return; }
    void fetch('/api/auth/welcome', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name }) }).catch(() => {});
    if (data?.requireEmailVerification) { setSuccess('Te enviamos un código de 6 dígitos a tu correo.'); setScreen('verify'); }
    else router.push('/mi-cuenta');
  }

  async function handleLogin() {
    reset(); setLoading(true);
    const { data, error: err } = await insforge.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data) router.push('/mi-cuenta');
  }

  async function handleVerify() {
    reset(); setLoading(true);
    const { data, error: err } = await insforge.auth.verifyEmail({ email, otp });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data) { setSuccess('Cuenta verificada. Redirigiendo...'); setTimeout(() => router.push('/mi-cuenta'), 900); }
  }

  async function handleResend() {
    reset(); setLoading(true);
    await insforge.auth.resendVerificationEmail({ email, redirectTo: `${window.location.origin}/auth` });
    setLoading(false);
    setSuccess('Código reenviado. Revisa tu correo.');
  }

  async function handleResetSend() {
    reset(); setLoading(true);
    await insforge.auth.sendResetPasswordEmail({ email, redirectTo: `${window.location.origin}/auth` });
    setLoading(false);
    setSuccess('Si el correo existe, recibirás un código en minutos.');
    setScreen('reset-code');
  }

  async function handleResetCode() {
    reset(); setLoading(true);
    const { data, error: err } = await insforge.auth.exchangeResetPasswordToken({ email, code: otp });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data?.token) { setResetToken(data.token); setScreen('reset-password'); }
  }

  async function handleResetPassword() {
    reset(); setLoading(true);
    const { data, error: err } = await insforge.auth.resetPassword({ newPassword, otp: resetToken });
    setLoading(false);
    if (err) { setError(err.message); return; }
    if (data) { setSuccess('Contraseña actualizada. Inicia sesión.'); setTimeout(() => setScreen('login'), 900); }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    reset();
    await insforge.auth.signInWithOAuth({ provider, redirectTo: `${window.location.origin}/mi-cuenta` });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.34),transparent_34rem),radial-gradient(circle_at_15%_90%,rgba(34,211,238,.16),transparent_28rem)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <button onClick={() => router.push('/')} className="mx-auto mb-8"><Omnifix3DTextLogo text="Omnifix" showTagline /></button>

        <section className="rounded-[2rem] border border-blue-300/15 bg-white/[0.07] p-6 shadow-[0_28px_80px_rgba(0,0,0,.38)] backdrop-blur-2xl sm:p-8">
          {screen === 'login' && (
            <div className="space-y-5">
              <div className="text-center"><h1 className="text-3xl font-black tracking-tight">Iniciar sesión</h1><p className="mt-2 text-sm text-slate-300">Entra a tu cuenta Omnifix para comprar y revisar pedidos.</p></div>
              <div className="grid grid-cols-2 gap-3"><button onClick={() => void handleOAuth('google')} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold"><IconGoogle /> Google</button><button onClick={() => void handleOAuth('github')} className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold"><Github className="h-5 w-5" /> GitHub</button></div>
              <Field label="Correo" type="email" value={email} onChange={setEmail} placeholder="usuario@email.com" />
              <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Tu contraseña" />
              <button onClick={() => { reset(); setScreen('reset-send'); }} className="block w-full text-right text-xs font-bold text-blue-200/70 hover:text-blue-100">¿Olvidaste tu contraseña?</button>
              <Notice text={error} /><Notice text={success} kind="success" />
              <PrimaryButton loading={loading} onClick={handleLogin}>Acceder</PrimaryButton>
              <p className="text-center text-sm text-slate-400">¿No tienes cuenta? <button onClick={() => { reset(); setScreen('register'); }} className="font-black text-blue-200 hover:text-white">Crear cuenta de tienda</button></p>
            </div>
          )}

          {screen === 'register' && (
            <div className="space-y-5">
              <div className="text-center"><UserPlus className="mx-auto h-8 w-8 text-blue-300" /><h1 className="mt-3 text-3xl font-black tracking-tight">Crear cuenta</h1><p className="mt-2 text-sm text-slate-300">Cuenta para clientes de la tienda Omnifix.</p></div>
              <Field label="Nombre de usuario" value={name} onChange={setName} placeholder="Nombre de usuario" />
              <Field label="Correo" type="email" value={email} onChange={setEmail} placeholder="usuario@email.com" />
              <Field label="Contraseña" type="password" value={password} onChange={setPassword} placeholder="Mínimo 6 caracteres" />
              <Notice text={error} /><Notice text={success} kind="success" />
              <PrimaryButton loading={loading} onClick={handleRegister}>Crear cuenta</PrimaryButton>
              <p className="text-center text-sm text-slate-400">¿Ya tienes cuenta? <button onClick={() => { reset(); setScreen('login'); }} className="font-black text-blue-200 hover:text-white">Iniciar sesión</button></p>
            </div>
          )}

          {screen === 'verify' && (
            <div className="space-y-5 text-center"><Mail className="mx-auto h-9 w-9 text-blue-300" /><h1 className="text-2xl font-black">Verifica tu correo</h1><p className="text-sm text-slate-300">Código enviado a <span className="text-blue-200">{email}</span></p><Field label="Código" value={otp} onChange={setOtp} placeholder="123456" /><Notice text={error} /><Notice text={success} kind="success" /><PrimaryButton loading={loading} onClick={handleVerify}>Confirmar código</PrimaryButton><button onClick={handleResend} className="text-sm font-bold text-blue-200/75">Reenviar código</button></div>
          )}

          {screen === 'reset-send' && (
            <div className="space-y-5"><h1 className="text-center text-2xl font-black">Recuperar acceso</h1><Field label="Correo de tu cuenta" type="email" value={email} onChange={setEmail} placeholder="usuario@email.com" /><Notice text={error} /><Notice text={success} kind="success" /><PrimaryButton loading={loading} onClick={handleResetSend}>Enviar código</PrimaryButton><button onClick={() => setScreen('login')} className="block w-full text-sm text-slate-400">Volver al inicio</button></div>
          )}

          {screen === 'reset-code' && (
            <div className="space-y-5"><h1 className="text-center text-2xl font-black">Ingresar código</h1><Field label="Código" value={otp} onChange={setOtp} placeholder="123456" /><Notice text={error} /><Notice text={success} kind="success" /><PrimaryButton loading={loading} onClick={handleResetCode}>Verificar código</PrimaryButton></div>
          )}

          {screen === 'reset-password' && (
            <div className="space-y-5"><h1 className="text-center text-2xl font-black">Nueva contraseña</h1><Field label="Nueva contraseña" type="password" value={newPassword} onChange={setNewPassword} placeholder="Mínimo 6 caracteres" /><Notice text={error} /><Notice text={success} kind="success" /><PrimaryButton loading={loading} onClick={handleResetPassword}>Actualizar contraseña</PrimaryButton></div>
          )}
        </section>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500"><ShieldCheck className="h-4 w-4" /> Plataforma segura Omnifix</div>
      </div>
    </main>
  );
}
