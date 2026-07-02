'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { MessageCircle, Star } from 'lucide-react';

type Comment = { name: string; rating: number; text: string; date: string };

const seedComments: Comment[] = [
  { name: 'Cliente Omnifix', rating: 5, text: 'Producto práctico, buena presentación y compra rápida.', date: 'Hace 2 días' },
  { name: 'María P.', rating: 5, text: 'La ficha se entiende fácil y el proceso de compra se siente seguro.', date: 'Hace 1 semana' },
];

export default function ProductComments({ productName }: { productName?: string }) {
  const [comments, setComments] = useState<Comment[]>(seedComments);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const score = useMemo(() => comments.length ? (comments.reduce((sum, item) => sum + item.rating, 0) / comments.length).toFixed(1) : '5.0', [comments]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setComments([{ name: name.trim(), rating: 5, text: text.trim(), date: 'Ahora' }, ...comments]);
    setName('');
    setText('');
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.075] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,.22)] backdrop-blur-2xl md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(255,255,255,.10),transparent_20rem),radial-gradient(circle_at_10%_80%,rgba(59,130,246,.12),transparent_22rem)]" />
      <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200/20 bg-blue-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-100"><MessageCircle className="h-3.5 w-3.5" /> Comentarios</p>
          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em]">Opiniones de clientes</h2>
          <p className="mt-3 text-sm leading-7 text-white/58">Comparte tu experiencia sobre {productName || 'este producto'} y ayuda a otros clientes a comprar mejor.</p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3"><Star className="h-4 w-4 fill-blue-200 text-blue-200" /><span className="text-lg font-black">{score}</span><span className="text-xs text-white/45">promedio</span></div>
        </div>

        <div>
          <form onSubmit={submit} className="grid gap-3">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre de usuario" className="h-12 rounded-2xl border border-white/10 bg-white/[0.08] px-4 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-blue-200/45" />
            <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Escribe tu comentario..." className="min-h-28 resize-none rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-white/35 focus:border-blue-200/45" />
            <button type="submit" className="h-12 rounded-full bg-[linear-gradient(135deg,#eaf2ff,#7fb2ff_45%,#2563eb)] text-sm font-black uppercase tracking-[0.16em] text-[#061326] shadow-[0_18px_46px_rgba(37,99,235,.30)] transition hover:-translate-y-0.5">Publicar comentario</button>
          </form>

          <div className="mt-5 grid gap-3">
            {comments.map((comment, index) => <article key={`${comment.name}-${index}`} className="rounded-[1.4rem] border border-white/10 bg-black/20 p-4"><div className="flex items-center justify-between gap-3"><b className="text-sm text-white">{comment.name}</b><span className="inline-flex items-center gap-1 text-xs font-bold text-blue-100"><Star className="h-3.5 w-3.5 fill-blue-200 text-blue-200" /> {comment.rating}.0</span></div><p className="mt-2 text-sm leading-6 text-white/62">{comment.text}</p><p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-white/32">{comment.date}</p></article>)}
          </div>
        </div>
      </div>
    </section>
  );
}
