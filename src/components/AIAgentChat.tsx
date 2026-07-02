'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, MessageCircle, Send, X } from 'lucide-react';
import { buildWhatsAppLink } from '@/lib/whatsapp';

type Msg = { id: string; role: 'user' | 'assistant'; content: string };
export interface AIAgentChatProps { hideOn?: string[] }

const STORAGE_KEY = 'omnifix.agent.history.v1';
const FALLBACK = 'Hola Omnifix, necesito hablar con una persona del equipo.';

function id() { return `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function bot(content: string): Msg { return { id: id(), role: 'assistant', content }; }
function load(): Msg[] { try { const raw = localStorage.getItem(STORAGE_KEY); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed.filter((m) => typeof m?.content === 'string').slice(-24) : []; } catch { return []; } }
function save(messages: Msg[]) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24))); } catch {} }

export default function AIAgentChat({ hideOn = ['/admin', '/auth', '/checkout'] }: AIAgentChatProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setMounted(true); setMessages(load()); }, []);
  useEffect(() => { if (mounted) save(messages); }, [messages, mounted]);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [messages, loading, open]);

  if (!mounted) return null;
  if (pathname && hideOn.some((route) => pathname.startsWith(route))) return null;

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const next: Msg[] = [...messages, { id: id(), role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; answer?: unknown; error?: unknown };
      const answer = res.ok && data.ok && typeof data.answer === 'string' ? data.answer : 'No pude responder ahora. Puedes escribir al equipo Omnifix por WhatsApp.';
      setMessages((prev) => [...prev, bot(answer)]);
    } catch {
      setMessages((prev) => [...prev, bot('No logré conectarme. Intenta de nuevo o habla con Omnifix por WhatsApp.')]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!open && (
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir asistente IA Omnifix" className="fixed bottom-24 right-4 z-[9500] grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-blue-300 via-cyan-300 to-blue-700 p-2 text-black shadow-[0_18px_48px_rgba(37,99,235,.48)] ring-1 ring-cyan-100/70 sm:bottom-7">
          <span className="grid h-full w-full place-items-center rounded-full bg-slate-950 ring-2 ring-cyan-100/55"><Bot className="h-6 w-6 text-cyan-200" /></span>
        </button>
      )}
      {open && (
        <section role="dialog" aria-label="Asistente IA Omnifix" className="fixed inset-x-0 bottom-0 top-0 z-[9501] flex flex-col bg-slate-950 text-white shadow-2xl ring-1 ring-blue-400/20 sm:inset-x-auto sm:bottom-7 sm:right-7 sm:top-auto sm:h-[560px] sm:w-[380px] sm:rounded-3xl">
          <header className="flex items-center gap-3 border-b border-blue-400/15 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 px-4 py-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-300 to-cyan-500"><Bot className="h-5 w-5 text-black" /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">Omnifix · Asistente IA</p><p className="truncate text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">En línea · Tienda tecnológica</p></div>
            <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-zinc-300"><X className="h-4 w-4" /></button>
          </header>
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && <div className="rounded-2xl bg-slate-900/80 p-4 text-sm leading-6 ring-1 ring-blue-400/10"><b className="text-cyan-200">Soy el asistente Omnifix.</b><p className="mt-1 text-zinc-300">Te ayudo con productos, compras, catálogo, checkout y soporte.</p></div>}
            {messages.map((m) => <div key={m.id} className={`mt-3 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'user' ? 'bg-cyan-300 text-black' : 'bg-slate-900 text-zinc-100'}`}>{m.content}</div></div>)}
            {loading && <p className="mt-3 text-xs uppercase tracking-[0.18em] text-cyan-300">Omnifix está pensando...</p>}
          </div>
          <div className="border-t border-blue-400/15 p-3">
            {messages.length > 0 && <div className="mb-2 flex justify-between text-[10px] uppercase tracking-[0.16em]"><a href={buildWhatsAppLink(FALLBACK)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-emerald-300"><MessageCircle className="h-3 w-3" /> Humano</a><button type="button" onClick={() => setMessages([])} className="text-zinc-500">Limpiar</button></div>}
            <form onSubmit={(e) => { e.preventDefault(); void send(input); }} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu pregunta…" className="min-w-0 flex-1 rounded-2xl border border-blue-400/15 bg-slate-900 px-3 py-2 text-sm outline-none" />
              <button type="submit" disabled={loading || !input.trim()} className="grid h-10 w-10 place-items-center rounded-full bg-cyan-300 text-black disabled:opacity-40"><Send className="h-4 w-4" /></button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}
