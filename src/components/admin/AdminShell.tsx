'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  Bot,
  ChevronRight,
  Database,
  ExternalLink,
  Eye,
  FileText,
  Globe2,
  Image as ImageIcon,
  LayoutGrid,
  Link2,
  LogOut,
  Mail,
  Menu,
  Package,
  Plus,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  Tag,
  Terminal,
  Truck,
  User,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAdminIdleLogout } from '@/hooks/useAdminIdleLogout';
import { AdminBottomNav } from '@/components/AdminBottomNav';
import { AdminCommandPalette, type CommandItem } from '@/components/admin/AdminCommandPalette';
import { BrandMark, BrandWordmark } from '@/components/admin/ui';
import WhatsNewBanner from '@/components/admin/WhatsNewBanner';
import DemoSessionTracker from '@/components/admin/DemoSessionTracker';

type LinkItem = { href: string; label: string; description: string; icon: LucideIcon; highlight?: boolean; superadminOnly?: boolean };
type Section = { title: string; links: LinkItem[] };

const navSections: Section[] = [
  { title: 'Control Omnifix', links: [
    { href: '/admin', label: 'Dashboard', description: 'KPIs, salud operativa y resumen general', icon: BarChart3, highlight: true },
    { href: '/admin/analytics', label: 'Analytics', description: 'Ventas, sesiones y rendimiento', icon: Activity, highlight: true },
    { href: '/admin/modulos', label: 'Módulos', description: 'Mapa modular del panel', icon: LayoutGrid },
    { href: '/admin/estado', label: 'Estado sistema', description: 'Diagnóstico de servicios y base de datos', icon: ShieldCheck },
  ] },
  { title: 'Tienda tecnológica', links: [
    { href: '/admin/productos', label: 'Productos', description: 'Catálogo, precios, imágenes y stock', icon: Package, highlight: true },
    { href: '/admin/productos/nuevo', label: 'Nuevo producto', description: 'Crear producto manualmente', icon: Plus },
    { href: '/admin/productos/importar', label: 'Importar productos', description: 'Importación desde URL o catálogo externo', icon: Link2 },
    { href: '/admin/tienda', label: 'Editar tienda', description: 'Portada, catálogo y experiencia visual', icon: Store, highlight: true },
    { href: '/admin/pedidos', label: 'Pedidos', description: 'Órdenes, pago y seguimiento', icon: ShoppingCart, highlight: true },
    { href: '/admin/clientes', label: 'Clientes', description: 'Cuentas, historial y recurrencia', icon: Users },
    { href: '/admin/cupones', label: 'Cupones', description: 'Promociones y descuentos', icon: Tag },
    { href: '/admin/envios', label: 'Envíos', description: 'Tarifas, zonas y coordinación', icon: Truck },
  ] },
  { title: 'Finanzas y comprobantes', links: [
    { href: '/admin/facturas', label: 'Facturas DTE', description: 'Boletas, facturas y documentos tributarios', icon: Receipt, highlight: true },
    { href: '/admin/reportes', label: 'Reportes', description: 'Ventas, márgenes y seguimiento', icon: FileText },
    { href: '/admin/pagos', label: 'Pagos', description: 'Pasarelas, cobros y métricas', icon: ShoppingCart },
    { href: '/admin/f29', label: 'F29', description: 'Impuestos y control mensual', icon: FileText },
  ] },
  { title: 'Contenido y marca', links: [
    { href: '/admin/home', label: 'Home principal', description: 'Hero, productos destacados y secciones', icon: LayoutGrid, highlight: true },
    { href: '/admin/editor', label: 'Editor universal', description: 'Navbar, footer, checkout, 404 y pantallas', icon: LayoutGrid, highlight: true },
    { href: '/admin/medios', label: 'Medios', description: 'Biblioteca de logos e imágenes', icon: ImageIcon },
    { href: '/admin/blog', label: 'Blog', description: 'Entradas y contenido SEO', icon: Globe2 },
    { href: '/admin/correo', label: 'Correo', description: 'Resend, notificaciones y campañas', icon: Mail },
  ] },
  { title: 'IA e integraciones', links: [
    { href: '/admin/asistente-ia', label: 'Asistente IA', description: 'Análisis, soporte y respuestas', icon: Sparkles, highlight: true },
    { href: '/admin/ai-developer', label: 'Omnifix AI Developer', description: 'Chat técnico y herramientas Git', icon: Bot, highlight: true },
    { href: '/admin/ia-config', label: 'Configurar IA', description: 'Modelos, API keys y proveedor activo', icon: Bot },
    { href: '/admin/integraciones/shopify', label: 'Shopify', description: 'Credenciales, catálogo, checkout y webhooks', icon: ShoppingBag, highlight: true, superadminOnly: true },
    { href: '/admin/integraciones', label: 'Integraciones', description: 'APIs, webhooks y servicios conectados', icon: Link2, highlight: true },
    { href: '/admin/sql', label: 'Terminal SQL', description: 'Consultas y migraciones InsForge', icon: Database },
  ] },
  { title: 'Sistema', links: [
    { href: '/admin/configuracion', label: 'Configuración', description: 'Preferencias generales de Omnifix', icon: Settings },
    { href: '/admin/perfil', label: 'Perfil admin', description: 'Foto, nombre y datos de contacto', icon: User },
    { href: '/admin/seguridad', label: 'Seguridad', description: 'Passkeys, acceso y protección', icon: ShieldCheck },
    { href: '/admin/vercel-logs', label: 'Logs Vercel', description: 'Build y runtime logs', icon: Terminal },
    { href: '/admin/manual', label: 'Manual', description: 'Guía técnica del panel', icon: FileText },
  ] },
];

const PATH_LABELS = Object.fromEntries(navSections.flatMap((s) => s.links.map((l) => [l.href.split('?')[0], l.label])));

function isActivePath(pathname: string, href: string) {
  const path = href.split('?')[0];
  return pathname === path || (path !== '/admin' && pathname.startsWith(path));
}

function AdminClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="flex items-center gap-1.5 text-[10px] font-semibold tabular-nums text-slate-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />{now?.toLocaleTimeString('es-CL', { hour12: false }) || '--:--:--'}</span>;
}

function AvatarCircle({ photo }: { photo?: string | null }) {
  return <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 border-blue-300/40 bg-black/60 shadow-lg">{photo ? <img src={photo} alt="Foto de perfil" className="h-full w-full object-cover" /> : <User className="m-auto h-5 w-5 text-blue-300/70" />}</span>;
}

function NavItem({ href, label, description, icon: Icon, active, onNavigate, highlight }: LinkItem & { active: boolean; onNavigate?: () => void }) {
  return <Link href={href} onClick={onNavigate} className={`group flex min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 transition ${active ? 'border-blue-300/50 bg-blue-400/15' : highlight ? 'border-blue-300/25 bg-blue-400/[0.06] hover:border-blue-300/50' : 'border-white/[0.06] bg-white/[0.025] hover:border-white/15'}`}><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-blue-400 text-white' : 'bg-blue-400/15 text-blue-300'}`}><Icon className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="flex min-w-0 items-center gap-2 text-[12.5px] font-black text-blue-50"><span className="truncate">{label}</span>{highlight && <span className="shrink-0 rounded-full border border-blue-300/35 bg-blue-400/12 px-1.5 py-px text-[8px] uppercase text-blue-200">Pro</span>}</span><span className="mt-0.5 block truncate text-[10.5px] text-slate-500">{description}</span></span><ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600 opacity-0 transition group-hover:opacity-100" /></Link>;
}

function SidebarContent({ pathname, onNavigate, onLogout, onClose, role, profilePhoto }: { pathname: string; onNavigate?: () => void; onLogout: () => void; onClose?: () => void; role: string | null; profilePhoto?: string | null }) {
  const [search, setSearch] = useState('');
  const allowed = useMemo(() => navSections.map((s) => ({ ...s, links: s.links.filter((l) => !l.superadminOnly || role === 'superadmin') })).filter((s) => s.links.length), [role]);
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allowed.map((s) => ({ ...s, links: term ? s.links.filter((l) => `${l.label} ${l.description} ${s.title}`.toLowerCase().includes(term)) : s.links })).filter((s) => s.links.length);
  }, [allowed, search]);
  const featured = allowed.flatMap((s) => s.links).filter((l) => l.highlight).slice(0, 6);

  return <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-[2rem] border border-blue-300/14 bg-slate-950/88 shadow-[0_26px_80px_rgba(15,23,42,.42)] backdrop-blur-2xl"><div className="shrink-0 border-b border-blue-300/10 p-4"><div className="flex items-center gap-3"><BrandMark size="lg" animated /><div className="min-w-0 flex-1"><BrandWordmark tagline="Admin · Control room" /><div className="mt-2 flex items-center gap-2"><span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-[0.18em] text-emerald-300">{role === 'superadmin' ? 'Superadmin' : role === 'viewer' ? 'Demo' : 'Admin'}</span><AdminClock /></div></div>{onClose && <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl border border-white/12 bg-black/35 text-white/70"><X className="h-5 w-5" /></button>}</div><label className="relative mt-4 block"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" /><input type="search" placeholder="Buscar Shopify, productos, pedidos..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 w-full rounded-2xl border border-blue-300/12 bg-black/30 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-blue-300/45" /></label></div><div className="min-h-0 flex-1 overflow-y-auto p-3 scrollbar-hide">{!search.trim() && <div className="mb-3 rounded-[1.35rem] border border-blue-300/20 bg-blue-400/[0.055] p-2.5"><p className="px-1 pb-2 text-[9px] font-black uppercase tracking-[0.28em] text-blue-200/70">Accesos rápidos</p><div className="grid grid-cols-2 gap-2">{featured.map((l) => <Link key={l.href} href={l.href} onClick={onNavigate} className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-2.5 py-2 hover:border-blue-300/35"><l.icon className="h-3.5 w-3.5 shrink-0 text-blue-300" /><span className="truncate text-[10px] font-black text-white/82">{l.label}</span></Link>)}</div></div>}{visible.length === 0 ? <div className="rounded-[1.5rem] border border-white/10 bg-black/25 px-4 py-8 text-center text-sm text-white">Sin módulos encontrados</div> : <div className="space-y-3">{visible.map((s) => <nav key={s.title} className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/22"><p className="px-4 pt-4 text-[10px] font-black uppercase tracking-[0.28em] text-blue-200/70">{s.title}</p><div className="space-y-1.5 p-2">{s.links.map((l) => <NavItem key={`${s.title}-${l.href}`} {...l} active={isActivePath(pathname, l.href)} onNavigate={onNavigate} />)}</div></nav>)}</div>}</div><button type="button" onClick={onLogout} className="m-3 flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/30 text-xs font-black uppercase tracking-[0.18em] text-slate-300 hover:text-rose-300"><LogOut className="h-4 w-4" /> Salir</button></div>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/admin';
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useAdminIdleLogout(10 * 60 * 1000);

  useEffect(() => { let cancelled = false; (async () => { try { const res = await fetch('/api/admin/me', { cache: 'no-store' }); if (!res.ok || cancelled) return; const json = await res.json() as { rol?: string }; setRole(json.rol ?? null); } catch {} })(); return () => { cancelled = true; }; }, []);
  useEffect(() => { let cancelled = false; (async () => { try { const res = await fetch('/api/admin/profile/photo', { cache: 'no-store' }); if (!res.ok || cancelled) return; const json = await res.json() as { photo?: string | null }; setProfilePhoto(json.photo ?? null); } catch {} })(); return () => { cancelled = true; }; }, []);

  const breadcrumb = useMemo(() => { if (PATH_LABELS[pathname]) return PATH_LABELS[pathname]; const segs = pathname.split('/').filter(Boolean); for (let i = segs.length; i > 0; i--) { const candidate = `/${segs.slice(0, i).join('/')}`; if (PATH_LABELS[candidate]) return PATH_LABELS[candidate]; } return 'Panel'; }, [pathname]);
  const commandItems = useMemo<CommandItem[]>(() => { const seen = new Set<string>(); const items: CommandItem[] = []; for (const section of navSections) for (const link of section.links) { if (link.superadminOnly && role !== 'superadmin') continue; if (seen.has(link.href)) continue; seen.add(link.href); items.push({ href: link.href, label: link.label, description: link.description }); } return items; }, [role]);
  async function handleLogout() { try { await fetch('/api/admin/logout', { method: 'POST' }); } catch {} router.replace('/admin/login'); }

  if (pathname.startsWith('/admin/observatory') || pathname === '/admin/login') return <>{children}</>;

  return <div data-admin-root="" className="relative min-h-screen overflow-x-hidden text-white"><header data-admin-header="" className="sticky top-0 z-40 border-b border-blue-300/15"><div className="absolute inset-0 bg-slate-950/78 backdrop-blur-2xl" /><div className="relative mx-auto flex max-w-[1700px] items-center justify-between gap-3 px-4 py-3 md:px-6"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => setMobileSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/30 bg-black/50 text-blue-300 lg:hidden"><Menu className="h-5 w-5" /></button><Link href="/admin" className="flex min-w-0 items-center gap-2.5"><BrandMark size="md" /><span className="hidden flex-col leading-none sm:flex"><span className="text-[13px] font-black tracking-[0.22em] text-blue-200">OMNIFIX</span><span className="mt-0.5 text-[9px] uppercase tracking-[0.3em] text-slate-500">Admin · Control room</span></span></Link><div className="hidden min-w-0 items-center gap-2 border-l border-white/10 pl-3 md:flex"><ChevronRight className="h-3.5 w-3.5 text-slate-600" /><span className="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-blue-300">{breadcrumb}</span></div></div><div className="hidden md:block"><AdminClock /></div><div className="flex items-center gap-2"><button type="button" onClick={() => setPaletteOpen(true)} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400"><Search className="h-3.5 w-3.5" /><span className="hidden md:inline">Buscar</span></button><Link href="/tienda" className="hidden items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300 sm:flex">Ver tienda <ExternalLink className="h-3 w-3" /></Link><Link href="/admin/perfil"><AvatarCircle photo={profilePhoto} /></Link><button onClick={handleLogout} className="flex items-center gap-1.5 rounded-full border border-white/10 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300"><LogOut className="h-3.5 w-3.5" /><span className="hidden sm:inline">Salir</span></button></div></div></header><div className="relative z-10 mx-auto grid max-w-[1700px] gap-5 px-3 py-4 pb-24 sm:px-4 md:px-6 md:py-6 lg:grid-cols-[390px_minmax(0,1fr)] lg:pb-6"><aside data-admin-sidebar="" className="hidden min-w-0 lg:sticky lg:top-[80px] lg:block lg:h-[calc(100vh-96px)] lg:overflow-hidden"><SidebarContent pathname={pathname} onLogout={handleLogout} role={role} profilePhoto={profilePhoto} /></aside><main data-admin-main="" className="relative min-w-0 max-w-full overflow-x-hidden">{role === 'viewer' && <DemoSessionTracker />}{role === 'viewer' && <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/[0.08] px-5 py-3.5"><Eye className="h-4 w-4 text-amber-400" /><span className="text-[12px] font-bold uppercase tracking-[0.18em] text-amber-300">Modo Demo · Solo lectura</span><span className="text-xs text-amber-300/55">Los cambios que intentes no se guardan · Expira en 24 h</span></div>}<WhatsNewBanner />{children}</main></div>{mobileSidebarOpen && <div className="fixed inset-0 z-[80] lg:hidden"><button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-black/72 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} /><div className="absolute inset-y-3 left-3 right-3"><SidebarContent pathname={pathname} onNavigate={() => setMobileSidebarOpen(false)} onClose={() => setMobileSidebarOpen(false)} onLogout={handleLogout} role={role} profilePhoto={profilePhoto} /></div></div>}<AdminBottomNav onOpenMore={() => setMobileSidebarOpen(true)} /><AdminCommandPalette items={commandItems} open={paletteOpen} onOpenChange={setPaletteOpen} /></div>;
}
