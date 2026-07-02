'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { X, Download } from 'lucide-react';
import Omnifix3DTextLogo from './Omnifix3DTextLogo';

declare global { interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>; } }

const DISMISS_KEY = 'omnifix.install.dismissed.v1';
const AUTO_DISMISS_MS = 60_000;

function trackPwa(event: string, extra?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try { void fetch('/api/pwa/track', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event, ...(extra ?? {}) }), keepalive: true }); } catch {}
}
function isStandaloneDisplay() { if (typeof window === 'undefined') return false; return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true; }

export default function InstallAppPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ua = window.navigator.userAgent.toLowerCase();
    const mobile = /iphone|ipad|ipod|android/.test(ua);
    const ios = /iphone|ipad|ipod/.test(ua);
    const hidden = window.localStorage.getItem(DISMISS_KEY) === '1';
    setIsMobile(mobile); setIsIos(ios); setDismissed(hidden || isStandaloneDisplay());
    const handleBeforeInstall = (event: Event) => { event.preventDefault(); setPromptEvent(event as BeforeInstallPromptEvent); setDismissed(hidden || isStandaloneDisplay()); trackPwa('install_prompt_available'); };
    const handleInstalled = () => { trackPwa('installed'); setDismissed(true); };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', handleBeforeInstall); window.removeEventListener('appinstalled', handleInstalled); };
  }, []);

  const close = useCallback(() => { setDismissed(true); setExpanded(false); if (typeof window !== 'undefined') window.localStorage.setItem(DISMISS_KEY, '1'); trackPwa('install_banner_dismissed'); }, []);
  useEffect(() => { if (dismissed) return; const timer = setTimeout(close, AUTO_DISMISS_MS); return () => clearTimeout(timer); }, [dismissed, close]);
  const install = async () => { if (!promptEvent) return; trackPwa('install_prompt_shown'); await promptEvent.prompt(); const choice = await promptEvent.userChoice; trackPwa(choice.outcome === 'accepted' ? 'install_accepted' : 'install_dismissed', { platform: choice.platform }); if (choice.outcome === 'accepted') close(); };
  const canShow = useMemo(() => Boolean(isMobile && !dismissed && !isStandaloneDisplay() && (promptEvent || isIos)), [dismissed, isIos, isMobile, promptEvent]);
  if (!canShow) return null;

  return <div className="fixed bottom-24 right-4 z-[9100] md:hidden">{expanded ? <div className="w-72 rounded-[1.75rem] border border-blue-400/20 bg-[#020617]/96 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)_both]"><button onClick={close} className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-zinc-500 hover:text-white"><X className="h-3.5 w-3.5" /></button><div className="mb-4 flex items-center gap-3"><Omnifix3DTextLogo compact showText={false} /><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-300">Instalar Omnifix</p><p className="text-xs text-zinc-400">App rápida · pantalla completa</p></div></div><p className="mb-4 text-xs leading-relaxed text-zinc-300">Accede más rápido desde tu pantalla de inicio para comprar, revisar pedidos y recibir soporte.</p>{isIos && !promptEvent ? <p className="mb-4 rounded-xl bg-white/5 p-3 text-xs text-zinc-400">Toca <strong className="text-white">Compartir</strong> y luego <strong className="text-white">Añadir a pantalla de inicio</strong>.</p> : null}<div className="flex gap-2">{promptEvent ? <button onClick={() => void install()} className="flex-1 rounded-full bg-blue-400 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-black">Instalar</button> : null}<button onClick={close} className="flex-1 rounded-full border border-white/10 py-2.5 text-[11px] font-semibold text-zinc-400 hover:text-white">No gracias</button></div></div> : <button onClick={() => setExpanded(true)} className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-400 text-black shadow-[0_8px_32px_rgba(37,99,235,0.45)] transition-transform duration-200 hover:scale-110 active:scale-95" aria-label="Instalar app Omnifix"><Download className="h-6 w-6" /></button>}<style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style></div>;
}
