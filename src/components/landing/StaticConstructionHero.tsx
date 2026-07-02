import Link from 'next/link';
import { ArrowRight, BadgeCheck, Cpu, Headphones, MessageCircle, ShieldCheck, ShoppingBag, Store, Zap } from 'lucide-react';

type Props = {
  coverUrl?: string;
};

const fallbackCover = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1800&auto=format&fit=crop';

const trustCards = [
  {
    icon: Store,
    title: 'Ecommerce operativo',
    text: 'Catálogo, carrito, pedidos y panel admin listos para vender con menos fricción.',
  },
  {
    icon: Cpu,
    title: 'Tecnología útil',
    text: 'Computadores, redes, seguridad, POS y smart home seleccionados para resolver problemas reales.',
  },
  {
    icon: Headphones,
    title: 'Soporte cercano',
    text: 'Más de 5 años vendiendo, instalando e innovando junto a clientes y negocios.',
  },
];

export default function StaticConstructionHero({ coverUrl }: Props) {
  const image = coverUrl || fallbackCover;
  return (
    <section className="relative overflow-hidden bg-[#05070d] px-3 pb-14 pt-24 text-white sm:px-6 lg:px-8 lg:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(37,99,235,.24),transparent_30rem),radial-gradient(circle_at_82%_42%,rgba(14,165,233,.13),transparent_28rem),linear-gradient(180deg,#05070d,#080a12_58%,#02030a)]" />
      <div className="relative mx-auto w-full max-w-[1500px]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 shadow-[0_35px_120px_rgba(0,0,0,.58)] backdrop-blur-xl sm:rounded-[2.8rem]">
          <div className="absolute inset-0">
            <img src={image} alt="Tecnología y ecommerce Omnifix" className="h-full w-full object-cover opacity-42 saturate-110" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,3,10,.96),rgba(2,3,10,.78)_47%,rgba(2,6,23,.35)),linear-gradient(180deg,rgba(2,3,10,.10),rgba(2,3,10,.94))]" />
          </div>

          <div className="relative grid min-h-[650px] gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:p-12 xl:min-h-[690px]">
            <div className="flex min-w-0 flex-col justify-center">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-400/25 bg-black/55 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-sky-100 backdrop-blur-xl">
                <BadgeCheck className="h-3.5 w-3.5 text-blue-300" /> Todo tiene una solución
              </div>
              <h1 className="mt-8 max-w-5xl text-5xl font-black leading-[.94] tracking-[-0.075em] text-white sm:text-7xl lg:text-8xl">
                Tecnología y ecommerce <span className="text-blue-400">sin fricción</span>
              </h1>
              <div className="mt-7 h-1.5 w-16 rounded-full bg-blue-400" />
              <p className="mt-7 max-w-3xl text-base leading-8 text-zinc-200 sm:text-xl">
                Omnifix reúne productos tecnológicos, tienda online y soporte para que compres, vendas y operes mejor.
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
                Más de 5 años en la industria vendiendo, implementando e innovando con clientes que necesitan soluciones claras.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/tienda" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-blue-400 px-6 text-sm font-black text-black shadow-[0_18px_45px_rgba(37,99,235,.28)] transition hover:-translate-y-0.5 hover:bg-white">
                  <ShoppingBag className="h-4 w-4" /> Comprar ahora
                </Link>
                <Link href="/admin" className="inline-flex h-14 items-center gap-2 rounded-2xl border border-white/20 bg-black/45 px-6 text-sm font-black text-white backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/10">
                  <ShieldCheck className="h-4 w-4" /> Panel admin
                </Link>
                <a href="https://wa.me/56930121625" target="_blank" rel="noopener noreferrer" className="inline-flex h-14 items-center gap-2 rounded-2xl border border-blue-400/30 bg-blue-400/10 px-6 text-sm font-black text-sky-100 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-blue-400 hover:text-black">
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>

            <aside className="flex min-w-0 items-end lg:items-center">
              <div className="w-full rounded-[2rem] border border-white/15 bg-black/62 p-5 shadow-[0_28px_90px_rgba(0,0,0,.42)] backdrop-blur-2xl">
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-blue-300/90">Módulos activos</p>
                <div className="grid gap-4">
                  {trustCards.map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex items-start gap-4 rounded-[1.45rem] border border-white/10 bg-white/[0.045] p-4">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-blue-400/25 bg-blue-400/10 text-blue-300"><Icon className="h-5 w-5" /></span>
                      <span><b className="block text-white">{title}</b><span className="mt-1 block text-sm leading-6 text-zinc-400">{text}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        <section className="mx-auto mt-12 max-w-6xl text-center">
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">Una tienda electrónica preparada para crecer</h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-zinc-400">
            Productos, carrito, checkout, clientes, pedidos, reportes y administración en una base moderna para Vercel.
          </p>
          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            <MiniValue title="Vende" text="Catálogo tecnológico con precios CLP, filtros, ofertas y ficha de producto." />
            <MiniValue title="Gestiona" text="Admin para productos, pedidos, clientes, métricas y contenido del sitio." />
            <MiniValue title="Escala" text="Base Next.js lista para conectar InsForge, Mercado Pago, Mercado Libre y analítica." />
          </div>
        </section>
      </div>
    </section>
  );
}

function MiniValue({ title, text }: { title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-6"><b className="block text-xl font-black text-blue-400">{title}</b><span className="mt-2 block text-sm leading-6 text-zinc-400">{text}</span></div>;
}
