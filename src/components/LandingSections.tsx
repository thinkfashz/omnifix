'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Cpu,
  Headphones,
  Home,
  Lightbulb,
  MessageCircle,
  Package,
  PlugZap,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import ContactMap from './ContactMap';
import ContactForm from './ContactForm';
import { buildWhatsAppLink } from '@/lib/whatsapp';
import { useSiteContent } from '@/hooks/useSiteContent';

const PRINCIPLES = [
  { Icon: ShieldCheck, title: 'Compra más segura', text: 'Productos claros, checkout protegido y comunicación directa antes y después de comprar.' },
  { Icon: Sparkles, title: 'Menos ruido', text: 'Catálogo ordenado para elegir tecnología útil sin perder tiempo entre opciones confusas.' },
  { Icon: Bot, title: 'Soporte inteligente', text: 'Asistencia para resolver dudas, revisar pedidos y orientar la compra según necesidad real.' },
];

const SERVICES = [
  { Icon: Smartphone, title: 'Accesorios móviles', text: 'Cargadores, cables, carcasas, energía portátil y accesorios para uso diario.', href: '/tienda' },
  { Icon: Headphones, title: 'Audio y entretenimiento', text: 'Parlantes, audífonos y equipos para trabajo, casa o movilidad.', href: '/tienda' },
  { Icon: Home, title: 'Smart home', text: 'Cámaras, sensores, iluminación inteligente y dispositivos conectados.', href: '/tienda' },
  { Icon: Cpu, title: 'Setup y productividad', text: 'Productos para mejorar escritorio, oficina, estudio y operación digital.', href: '/tienda' },
];

const PRODUCT_CATEGORIES = [
  { Icon: Smartphone, title: 'Telefonía', text: 'Accesorios, carga y protección para dispositivos móviles.' },
  { Icon: Headphones, title: 'Audio', text: 'Parlantes, audífonos y sonido portátil.' },
  { Icon: PlugZap, title: 'Carga', text: 'Cargadores, cables y power banks.' },
  { Icon: Home, title: 'Smart Home', text: 'Cámaras, sensores y control inteligente.' },
  { Icon: Lightbulb, title: 'Iluminación tech', text: 'Luces inteligentes y soluciones LED.' },
  { Icon: Package, title: 'Accesorios', text: 'Productos útiles para completar tu ecosistema digital.' },
];

const WHY_US = [
  'Tienda enfocada en productos tecnológicos y accesorios útiles.',
  'Checkout seguro con Shopify cuando el producto viene del catálogo conectado.',
  'Cuenta de usuario para mantener compras, datos y pedidos organizados.',
  'Soporte directo para resolver dudas antes de pagar.',
];

const PROCESS = [
  { step: '01', title: 'Exploras', text: 'Buscas productos por categoría, uso o necesidad.' },
  { step: '02', title: 'Agregas', text: 'Añades al carrito y revisas cantidades, precio y disponibilidad.' },
  { step: '03', title: 'Creas cuenta', text: 'Guardas tus datos para compras, pedidos y soporte.' },
  { step: '04', title: 'Finalizas', text: 'Pagas en checkout seguro y coordinas entrega o retiro.' },
];

const MetaIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
const TikTokIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" /></svg>;
const InstagramIcon = () => <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>;

export default function LandingSections({ copyrightText, socialLinks }: { copyrightText?: string; socialLinks?: { facebook?: string; instagram?: string; tiktok?: string } } = {}) {
  const footer = useSiteContent('footer');
  const copyrightHtml = (copyrightText && copyrightText.trim()) ? copyrightText.replaceAll('{year}', String(new Date().getFullYear())) : (footer.legal || `© ${new Date().getFullYear()} Omnifix - Todos los derechos reservados`).replaceAll('{year}', String(new Date().getFullYear()));
  const taglineText = footer.tagline || 'Tecnología, accesorios y comercio inteligente para tu vida digital.';
  const fbHref = socialLinks?.facebook?.trim() || '#';
  const igHref = socialLinks?.instagram?.trim() || '#';
  const ttHref = socialLinks?.tiktok?.trim() || '#';

  return (
    <div className="overflow-x-hidden bg-black text-white">
      <section className="border-t border-white/5 bg-[#020617] px-4 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Enfoque Omnifix" title="Tecnología simple para comprar mejor" text="Menos pasos, menos confusión y una experiencia clara para encontrar productos útiles, crear tu cuenta y finalizar con checkout seguro." /><div className="mt-12 grid gap-4 md:grid-cols-3">{PRINCIPLES.map(({ Icon, title, text }) => <ValueCard key={title} Icon={Icon} title={title} text={text} />)}</div></div>
      </section>

      <section id="soluciones" className="border-t border-white/5 px-4 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Soluciones" title="Todo tu ecosistema digital en un catálogo" text="Productos tecnológicos, accesorios y soporte para que cada compra tenga sentido desde el primer clic." /><div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{SERVICES.map(({ Icon, title, text, href }) => <Link key={title} href={href} className="group block rounded-[1.6rem] border border-white/10 bg-zinc-950/75 p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-zinc-900"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-blue-400/25 bg-blue-400/10 text-blue-400 transition group-hover:bg-blue-400 group-hover:text-black"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-lg font-black leading-tight text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-zinc-400">{text}</p><span className="mt-5 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-blue-400">Ver productos <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></Link>)}</div></div>
      </section>

      <section id="tienda" className="relative overflow-hidden border-t border-white/5 bg-[#070707] px-4 py-20 md:px-12 md:py-28"><div aria-hidden className="pointer-events-none absolute inset-0"><div className="absolute -right-24 -top-32 h-96 w-96 rounded-full bg-blue-400/15 blur-3xl" /><div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-blue-700/10 blur-3xl" /></div><div className="relative mx-auto max-w-7xl"><SectionHeader eyebrow="Tienda" title="Productos tecnológicos listos para comprar" text="Explora productos por categoría, agrega al carrito y continúa al checkout seguro." /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PRODUCT_CATEGORIES.map(({ Icon, title, text }) => <Link key={title} href="/tienda" className="group flex items-start gap-4 rounded-[1.4rem] border border-white/10 bg-black/55 p-5 backdrop-blur transition hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[0.04]"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-blue-400 transition group-hover:bg-blue-400 group-hover:text-black"><Icon className="h-5 w-5" /></span><span><b className="block text-sm font-black uppercase tracking-[0.12em] text-white">{title}</b><span className="mt-2 block text-sm leading-6 text-zinc-400">{text}</span></span></Link>)}</div></div></section>

      <section className="border-t border-white/5 px-4 py-20 md:px-12 md:py-28"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center"><div><SectionHeader eyebrow="Por qué Omnifix" title="Compra ordenada, cuenta clara y soporte directo" text="Una experiencia pensada para tecnología: catálogo simple, carrito rápido, cuenta de cliente y comunicación sin fricción." /></div><div className="grid gap-3 sm:grid-cols-2">{WHY_US.map((item) => <div key={item} className="rounded-[1.4rem] border border-white/10 bg-black/55 p-5"><CheckCircle2 className="h-5 w-5 text-blue-400" /><p className="mt-4 text-sm leading-7 text-zinc-300">{item}</p></div>)}</div></div></section>

      <section className="border-t border-white/5 px-4 py-20 md:px-12 md:py-28"><div className="mx-auto max-w-7xl"><SectionHeader eyebrow="Proceso" title="Así compras en Omnifix" text="Un flujo simple para pasar de buscar un producto a tener una compra organizada." /><div className="mt-12 grid gap-4 md:grid-cols-4">{PROCESS.map(({ step, title, text }) => <div key={step} className="rounded-[1.6rem] border border-white/10 bg-zinc-950/80 p-6"><span className="text-4xl font-black text-blue-400/30">{step}</span><h3 className="mt-5 text-lg font-black text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-zinc-400">{text}</p></div>)}</div></div></section>

      <section id="contacto" className="border-t border-white/5 bg-[#070707] px-4 py-20 md:px-12 md:py-28"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start"><div className="space-y-8"><div><p className="text-[10px] font-black uppercase tracking-[0.34em] text-blue-400">Contacto directo</p><h2 className="mt-4 text-4xl font-black leading-[0.98] tracking-tight text-white md:text-6xl">Compra, consulta o conecta tu tienda.</h2><p className="mt-5 max-w-xl text-base leading-8 text-zinc-400">Cuéntanos qué producto buscas, qué integración necesitas o qué duda tienes antes de comprar.</p></div><div className="grid gap-3 sm:grid-cols-2"><ContactNote Icon={MessageCircle} title="Soporte" text="Consultas por WhatsApp y seguimiento de pedidos." /><ContactNote Icon={Zap} title="Respuesta rápida" text="Orientación simple para elegir mejor." /></div><ContactMap className="min-h-[22rem]" title="Omnifix" subtitle="Tienda tecnológica" /></div><div className="rounded-[2rem] border border-white/10 bg-zinc-950/80 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8"><ContactForm /></div></div></section>

      <footer className="border-t border-white/10 bg-black px-4 py-12 md:px-12"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]"><div><p className="text-lg font-black uppercase tracking-[0.14em] text-white">Omnifix <span className="text-blue-400">Tech Store</span></p><p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">{taglineText}</p><div className="mt-5 flex gap-3"><SocialLink href={fbHref} label="Facebook"><MetaIcon /></SocialLink><SocialLink href={igHref} label="Instagram"><InstagramIcon /></SocialLink><SocialLink href={ttHref} label="TikTok"><TikTokIcon /></SocialLink></div></div><FooterColumn title="Explorar" items={[["Tienda", "/tienda"], ["Catálogo", "/tienda"], ["Cuenta", "/auth"], ["Contacto", "/contacto"]]} /><FooterColumn title="Contacto" items={[["WhatsApp", buildWhatsAppLink('Hola Omnifix, necesito ayuda.')], ["Soporte", "/contacto"], ["Productos", "/tienda"]]} /></div><div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-xs leading-6 text-zinc-500" dangerouslySetInnerHTML={{ __html: copyrightHtml }} /></footer>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div className="mx-auto max-w-3xl text-center"><p className="text-[10px] font-black uppercase tracking-[0.34em] text-blue-400">{eyebrow}</p><h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white md:text-5xl">{title}</h2><p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">{text}</p></div>; }
function ValueCard({ Icon, title, text }: { Icon: LucideIcon; title: string; text: string }) { return <div className="rounded-[1.6rem] border border-white/10 bg-black/50 p-6 backdrop-blur-xl"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-blue-400/25 bg-blue-400/10 text-blue-400"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-xl font-black text-white">{title}</h3><p className="mt-3 text-sm leading-7 text-zinc-400">{text}</p></div>; }
function ContactNote({ Icon, title, text }: { Icon: LucideIcon; title: string; text: string }) { return <div className="rounded-[1.4rem] border border-white/10 bg-black/50 p-5"><Icon className="h-5 w-5 text-blue-400" /><b className="mt-4 block text-sm font-black uppercase tracking-[0.12em] text-white">{title}</b><p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p></div>; }
function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) { return <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-blue-400/50 hover:text-blue-400">{children}</a>; }
function FooterColumn({ title, items }: { title: string; items: [string, string][] }) { return <div><h3 className="text-[11px] font-black uppercase tracking-[0.24em] text-white">{title}</h3><div className="mt-4 flex flex-col gap-2">{items.map(([label, href]) => <Link key={label + href} href={href} className="text-sm text-zinc-400 transition hover:text-blue-400">{label}</Link>)}</div></div>; }
