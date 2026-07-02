'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bot, Headphones, ShoppingBag, Sparkles, Zap } from 'lucide-react';

const features = [
  { icon: ShoppingBag, title: 'Tienda tech', text: 'Productos, pedidos y checkout conectado.' },
  { icon: Bot, title: 'Automatización', text: 'Flujos simples para vender y responder mejor.' },
  { icon: Zap, title: 'Smart gadgets', text: 'Accesorios, energía, audio y smart home.' },
];

export default function OmnifixHomeExperience() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(37,99,235,.30),transparent_34rem),radial-gradient(circle_at_86%_78%,rgba(34,211,238,.16),transparent_30rem),linear-gradient(180deg,#020617,#050816)]" />
      <div className="pointer-events-none fixed -left-40 top-24 h-96 w-[58rem] rounded-[100%] border border-blue-400/20 bg-blue-400/[0.04] blur-sm" />
      <div className="pointer-events-none fixed -right-52 top-80 h-96 w-[58rem] rounded-[100%] border border-cyan-300/15 bg-cyan-300/[0.03] blur-sm" />

      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-28 pt-8 md:px-8 md:pt-10">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative grid h-14 w-14 overflow-hidden rounded-2xl border border-blue-400/25 bg-white shadow-[0_0_30px_rgba(37,99,235,.22)]"><Image src="/omnifix-logo.svg" alt="Omnifix" fill sizes="56px" className="object-cover" priority /></span>
            <span><b className="block text-sm font-black uppercase tracking-[0.22em]">OMNIFIX</b><small className="block text-[10px] uppercase tracking-[0.24em] text-blue-200/65">Todo tiene solución</small></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth" className="hidden rounded-full border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-white/80 transition hover:border-blue-400/40 hover:text-blue-200 sm:inline-flex">Mi cuenta</Link>
            <Link href="/tienda" className="rounded-full bg-blue-400 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white">Tienda</Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-cyan-100"><Sparkles className="h-4 w-4" /> Tecnología + comercio</p>
            <h1 className="mt-6 max-w-4xl text-[clamp(48px,13vw,118px)] font-black leading-[0.84] tracking-[-0.08em]">Compra, conecta y automatiza.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 md:text-lg">Una tienda tecnológica con experiencia limpia, productos seleccionados y soporte directo para mantener tus compras organizadas.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/tienda" className="inline-flex h-14 items-center gap-3 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-700 px-7 text-sm font-black uppercase tracking-[0.18em] text-black shadow-[0_0_40px_rgba(37,99,235,.34)]">Explorar tienda <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/auth?mode=register" className="inline-flex h-14 items-center rounded-full border border-white/10 px-7 text-sm font-black uppercase tracking-[0.18em] text-white/80 transition hover:border-blue-400/40 hover:text-blue-200">Crear cuenta</Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
            <div className="absolute -inset-8 rounded-[3rem] bg-blue-500/18 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.6rem] border border-blue-400/20 bg-white/[0.08] p-5 shadow-[0_28px_90px_rgba(0,0,0,.48)] backdrop-blur-2xl">
              <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-white"><Image src="/omnifix-logo.svg" alt="Logo Omnifix" fill sizes="420px" className="object-cover" priority /></div>
              <div className="mt-5 grid grid-cols-3 gap-2">{['Audio', 'Carga', 'Smart'].map((item) => <span key={item} className="rounded-2xl bg-black/30 px-2 py-3 text-center text-[10px] font-black uppercase tracking-[0.12em] text-blue-100">{item}</span>)}</div>
            </div>
          </div>
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <article key={title} className="rounded-[1.8rem] border border-blue-400/15 bg-white/[0.055] p-5 backdrop-blur-xl">
              <Icon className="h-6 w-6 text-blue-300" />
              <h2 className="mt-4 text-xl font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </article>
          ))}
        </section>

        <footer className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Omnifix. Tecnología, automatización y comercio inteligente.</p>
          <Link href="/politica-de-privacidad" className="inline-flex items-center gap-2 text-blue-200/70 hover:text-blue-200"><Headphones className="h-4 w-4" /> Privacidad y términos</Link>
        </footer>
      </section>
    </main>
  );
}
