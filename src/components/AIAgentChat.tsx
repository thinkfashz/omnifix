'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Bot, Send, X, Minimize2, MessageCircle, Sparkles } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/whatsapp';

type Role = 'user' | 'assistant';
interface Msg { id: string; role: Role; content: string }
interface AIAgentChatProps { hideOn?: string[] }

const STORAGE_HISTORY = 'omnifix.agent.history.v1';
const MAX_HISTORY = 24;

const SUGGESTIONS = [
  { label: 'Productos destacados', icon: Sparkles, prompt: 'Muéstrame productos tecnológicos destacados de Omnifix.' },
  { label: 'Ayuda con compra', icon: Sparkles, prompt: 'Quiero comprar en Omnifix, ¿cómo funciona el carrito y el checkout?' },
  { label: 'Smart home', icon: Sparkles, prompt: 'Recomiéndame productos smart home para mi casa o negocio.' },
  { label: 'Soporte', icon: Sparkles, prompt: 'Necesito ayuda con un pedido o producto de Omnifix.' },
] as const;

const WHATSAPP_FALLBACK_MSG = 'Hola Omnifix, estaba conversando con el asistente del sitio y me gustaría hablar con una persona. ¿Me pueden ayudar?';

function loadHistory(): Msg[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return (parsed as Msg[]).filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').slice(-MAX_HISTORY);
  } catch { return []; }
}
function saveHistory(msgs: Msg[]) { try { window.localStorage.setItem(STORAGE_HISTORY, JSON.stringify(msgs.slice(-MAX_HISTORY))); } catch {} }
function newId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`; }

export default function AIAgentChat({ hideOn = ['/admin', '/auth', '/checkout'] }: AIAgentChatProps) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { setMounted(true); setMessages(loadHistory()); }, []);
  useEffect(() => { if (mounted) saveHistory(messages); }, [messages, mounted]);
  useEffect(() => { const el = scrollRef.current; if (el) el.scrollTop = el.scrollHeight; }, [messages, loading, open]);
  useEffect(() => { if (!open) return; const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [open]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    const userMsg: Msg = { id: newId(), role: 'user', content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const res = await fetch('/api/agent/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }), signal: ctrl.signal });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; answer?: string; error?: string };
      if (!res.ok || !data.ok || typeof data.answer !== 'string') {
        const errMsg = data.error || 'No pude responder ahora. Intenta de nuevo o escríbenos por WhatsApp.';
        setError(errMsg);
        setMessages((prev) => [...prev, { id: newId(), role: 'assistant', content: errMsg }]);
      } else {
        setMessages((prev) => [...prev, { id: newId(), role: 'assistant', content: data.answer }]);
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg = 'No logré conectarme al asistente. ¿Quieres hablar con el equipo Omnifix por WhatsApp?';
      setError('No pudimos conectarnos. Revisa tu conexión e intenta de nuevo.');
      setMessages((prev) => [...prev, { id: newId(), role: 'assistant', content: msg }]);
    } finally { setLoading(false); abortRef.current = null; }
  }, [loading, messages]);

  const clearChat = useCallback(() => { setMessages([]); saveHistory([]); setError(null); inputRef.current?.focus(); }, []);
  if (!mounted) return null;
  if (pathname && hideOn.some((p) => pathname.startsWith(p))) return null;

  return <>
    <AnimatePresence>{!open && <motion.button key="fab" type="button" initial={{ opacity: 0, scale: 0.82 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.82 }} transition={{ duration: 0.22 }} onClick={() => setOpen(true)} aria-label="Abrir asistente IA Omnifix" title="Abrir asistente Omnifix" className="fixed bottom-24 right-4 z-[9500] grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-700 p-2 text-black shadow-[0_18px_48px_rgba(37,99,235,0.48),0_0_0_7px_rgba(59,130,246,.13)] ring-1 ring-cyan-100/70 transition active:scale-95 sm:bottom-7 sm:h-[72px] sm:w-[72px]"><span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-blue-400/35 blur-md motion-safe:animate-[omni-fab-pulse_2.8s_ease-out_infinite]" /><span className="relative grid h-full w-full place-items-center rounded-full bg-slate-950 ring-2 ring-cyan-100/55"><Bot size={23} className="text-cyan-200" aria-hidden /><span className="absolute -bottom-0.5 -right-0.5 block h-3.5 w-3.5 rounded-full border-2 border-blue-400 bg-emerald-400 motion-safe:animate-pulse" /></span><style>{`@keyframes omni-fab-pulse{0%{transform:scale(1);opacity:.55}70%,100%{transform:scale(1.42);opacity:0}}`}</style></motion.button>}</AnimatePresence>
    <AnimatePresence>{open && <><motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-[9499] bg-black/55 backdrop-blur-sm sm:hidden" aria-hidden />
      <motion.div key="panel" role="dialog" aria-modal="true" aria-label="Asistente IA Omnifix" initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }} transition={{ duration: 0.28 }} className="fixed inset-x-0 bottom-0 top-0 z-[9501] flex flex-col overflow-hidden rounded-none bg-slate-950 text-white shadow-[0_30px_80px_rgba(0,0,0,0.7)] ring-1 ring-blue-400/20 sm:inset-x-auto sm:bottom-7 sm:right-7 sm:top-auto sm:h-[560px] sm:w-[380px] sm:rounded-3xl" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <header className="flex shrink-0 items-center gap-3 border-b border-blue-400/15 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 px-4 py-3"><div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-300 to-cyan-500 ring-2 ring-blue-200/40"><Bot size={18} className="text-black" aria-hidden /><span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 rounded-full border-2 border-slate-950 bg-emerald-400 motion-safe:animate-pulse" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-black tracking-tight">Omnifix · Asistente IA</p><p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">En línea · Tienda tecnológica</p></div><button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/5 hover:text-white" aria-label="Minimizar chat"><Minimize2 size={16} /></button><button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-red-500/10 hover:text-red-300" aria-label="Cerrar chat"><X size={16} /></button></header>
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">{messages.length === 0 && <div className="space-y-3"><div className="rounded-2xl rounded-bl-sm bg-slate-900/80 px-4 py-3 text-sm leading-relaxed text-zinc-200 ring-1 ring-blue-400/10"><p className="font-semibold text-cyan-200">¡Hola! Soy el asistente Omnifix.</p><p className="mt-1 text-zinc-300">Te ayudo con productos, compras, catálogo, checkout, soporte y soluciones tecnológicas.</p></div><div className="flex flex-wrap gap-2 pt-1">{SUGGESTIONS.map(({ label, prompt, icon: Icon }) => <button key={label} type="button" onClick={() => send(prompt)} className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/25 bg-blue-400/[0.08] px-3 py-1.5 text-[11px] font-semibold text-blue-100 transition hover:border-cyan-300/60 hover:bg-blue-400/[0.16]"><Icon size={11} className="text-cyan-200" />{label}</button>)}</div></div>}
          {messages.map((m) => <div key={m.id} className={`mt-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ring-1 ${m.role === 'user' ? 'rounded-br-sm bg-gradient-to-br from-blue-300 to-cyan-500 text-black ring-cyan-200/40' : 'rounded-bl-sm bg-slate-900/80 text-zinc-200 ring-blue-400/10'}`}>{m.content}</div></div>)}
          {loading && <div className="mt-3 flex justify-start"><div className="rounded-2xl rounded-bl-sm bg-slate-900/80 px-3.5 py-2.5 ring-1 ring-blue-400/10"><ThinkingDots /></div></div>}{error && messages.length === 0 && <p className="mt-3 text-xs text-red-300/90">{error}</p>}
        </div>
        <div className="shrink-0 border-t border-blue-400/15 bg-slate-950/95 backdrop-blur">{messages.length > 0 && <div className="flex items-center justify-between gap-2 px-4 pt-2 text-[10px] font-semibold uppercase tracking-[0.16em]"><a href={buildWhatsAppLink(WHATSAPP_FALLBACK_MSG)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-200 transition hover:border-emerald-400"><MessageCircle size={11} /> Humano</a><button type="button" onClick={clearChat} className="text-zinc-500 transition hover:text-zinc-200">Limpiar</button></div>}<form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 p-3"><textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }} rows={1} placeholder="Escribe tu pregunta…" aria-label="Mensaje al asistente Omnifix" disabled={loading} className="max-h-32 min-h-[40px] flex-1 resize-none rounded-2xl border border-blue-400/15 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-cyan-300/60 disabled:opacity-60" /><button type="submit" disabled={loading || input.trim().length === 0} aria-label="Enviar mensaje" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-300 to-cyan-500 text-black shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition hover:brightness-110 disabled:opacity-40"><Send size={16} /></button></form><p className="px-4 pb-3 text-[9px] uppercase tracking-[0.18em] text-zinc-600">Respuestas generadas por IA · Verifica datos críticos con Omnifix</p></div>
      </motion.div></>}</AnimatePresence>
  </>;
}

function ThinkingDots() { return <div className="flex items-center gap-2"><div className="flex items-center gap-1" aria-label="Pensando" role="status">{[0, 1, 2].map((i) => <motion.span key={i} className="block h-2 w-2 rounded-full bg-cyan-300" animate={{ y: [0, -4, 0], opacity: [0.45, 1, 0.45] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }} />)}</div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Omnifix está pensando</span></div>; }

export type { AIAgentChatProps };
