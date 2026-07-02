'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY = 'omnifix.cookie-consent.v1';

type Consent = { necessary: true; analytics: boolean; marketing: boolean; at: string };

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try { setVisible(!localStorage.getItem(KEY)); } catch { setVisible(true); }
  }, []);

  function save(next: Omit<Consent, 'necessary' | 'at'>) {
    const consent: Consent = { necessary: true, analytics: next.analytics, marketing: next.marketing, at: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(consent)); } catch {}
    window.dispatchEvent(new CustomEvent('omnifix-cookie-consent', { detail: consent }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <section className="fixed inset-x-3 bottom-3 z-[9998] mx-auto max-w-3xl rounded-[1.6rem] border border-blue-400/20 bg-slate-950/95 p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,.45)] backdrop-blur-2xl md:p-5" aria-label="Consentimiento de privacidad y cookies">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">Privacidad Omnifix</p>
          <h2 className="mt-2 text-lg font-black">Cookies y datos de compra</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">Usamos cookies necesarias para que la tienda funcione y, con tu permiso, analíticas o marketing. También podemos tratar datos como nombre, correo, teléfono, dirección, carrito y pedidos para compra, despacho, soporte y seguridad.</p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-blue-200/80"><Link href="/politica-de-privacidad">Privacidad</Link><Link href="/politica-de-cookies">Cookies</Link><Link href="/terminos-y-condiciones">Términos</Link></div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 md:w-56">
          <button onClick={() => save({ analytics: true, marketing: true })} className="rounded-full bg-blue-400 px-5 py-3 text-xs font-black uppercase tracking-[.16em] text-black">Aceptar</button>
          <button onClick={() => save({ analytics: false, marketing: false })} className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[.16em] text-white/80">Solo necesarias</button>
          <button onClick={() => setSettings((v) => !v)} className="rounded-full bg-white/[.06] px-5 py-3 text-xs font-black uppercase tracking-[.16em] text-white/80">Configurar</button>
        </div>
      </div>
      {settings && <div className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-sm text-slate-300"><label className="flex items-center justify-between gap-3 rounded-2xl bg-white/[.04] p-3"><span><b className="block text-white">Analíticas</b><small>Medición de visitas, rendimiento y errores.</small></span><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /></label><label className="flex items-center justify-between gap-3 rounded-2xl bg-white/[.04] p-3"><span><b className="block text-white">Marketing</b><small>Ofertas, campañas y mejora de recomendaciones.</small></span><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /></label><button onClick={() => save({ analytics, marketing })} className="mt-2 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[.16em] text-black">Guardar preferencias</button></div>}
    </section>
  );
}
