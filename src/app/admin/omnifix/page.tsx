import Link from 'next/link';
import { ArrowRight, BarChart3, Boxes, CreditCard, Gauge, PackagePlus, ShieldCheck, Truck, Users } from 'lucide-react';

const modules = [
  { icon: Boxes, title: 'Productos y categorías', text: 'Alta, edición, stock, precios CLP, ofertas y fichas técnicas.', href: '/admin/productos' },
  { icon: CreditCard, title: 'Pedidos y checkout', text: 'Seguimiento de compras, pagos, estados y recuperación de carritos.', href: '/admin/tienda' },
  { icon: Users, title: 'Clientes', text: 'Cuentas, historial, preferencias y atención postventa.', href: '/admin/clientes' },
  { icon: Truck, title: 'Despacho e instalación', text: 'Coordinación de entrega, visitas técnicas y servicios opcionales.', href: '/admin/tienda' },
  { icon: BarChart3, title: 'KPIs ecommerce', text: 'Ventas, productos más vistos, leads, conversión y rendimiento comercial.', href: '/admin/reportes' },
  { icon: ShieldCheck, title: 'Seguridad y roles', text: 'Sesiones, permisos, auditoría y protección del panel administrativo.', href: '/admin/seguridad' },
];

export default function OmnifixAdminModulesPage() {
  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-10 text-white md:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_30px_100px_rgba(0,0,0,.38)] md:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_8%,rgba(37,99,235,.22),transparent_24rem),linear-gradient(135deg,rgba(255,255,255,.05),transparent_42%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-blue-400/25 bg-blue-400/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-blue-200">Omnifix admin</span>
              <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.06em] md:text-6xl">Módulos necesarios para operar el ecommerce</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-400">Panel central para productos, pedidos, clientes, despacho, analítica y seguridad. Diseñado para una tienda electrónica moderna con operación real.</p>
            </div>
            <div className="rounded-[1.8rem] border border-blue-400/20 bg-black/45 p-5">
              <Gauge className="h-8 w-8 text-blue-300" />
              <p className="mt-4 text-sm text-zinc-400">Estado recomendado</p>
              <b className="mt-1 block text-2xl text-white">Listo para Cloudflare</b>
              <p className="mt-2 text-sm leading-6 text-zinc-500">Configura las variables indicadas en Cloudflare y conecta InsForge para persistencia.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modules.map(({ icon: Icon, title, text, href }) => (
            <Link key={title} href={href} className="group rounded-[1.8rem] border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.06]">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-blue-400/25 bg-blue-400/10 text-blue-300"><Icon className="h-5 w-5" /></span>
              <h2 className="mt-5 text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-300">Abrir módulo <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-[1.8rem] border border-white/10 bg-black/35 p-6">
          <PackagePlus className="h-7 w-7 text-blue-300" />
          <h2 className="mt-4 text-2xl font-black">Flujo base recomendado</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">Carga productos, valida precios y stock, conecta pagos, prueba checkout, configura despacho y revisa métricas desde reportes. Con eso Omnifix queda preparado para venta tecnológica real.</p>
        </div>
      </section>
    </main>
  );
}
