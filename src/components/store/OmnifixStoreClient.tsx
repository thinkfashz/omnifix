'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { useCartContext } from '@/context/CartContext';

type Product = { id: string; name: string; price: number; description?: string; image_url?: string; img?: string; category?: string; category_id?: string; category_name?: string; stock?: number | string; discount_percentage?: number; discountPercentage?: number; shopifyVariantId?: string; shopifyProductId?: string; shopifyHandle?: string };
const demo: Product[] = [
  { id: 'demo-audio', name: 'Audífonos Bluetooth Pro', price: 24990, category: 'Audio', description: 'Audio inalámbrico para trabajo y movilidad.', image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=900&auto=format&fit=crop' },
  { id: 'demo-power', name: 'Power Bank carga rápida', price: 19990, category: 'Energía', description: 'Energía portátil para tus equipos.', image_url: 'https://images.unsplash.com/photo-1609592806596-b43bada2f8e9?q=80&w=900&auto=format&fit=crop' },
  { id: 'demo-smart', name: 'Kit Smart Home WiFi', price: 34990, category: 'Smart Home', description: 'Control inteligente para casa y negocio.', image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=900&auto=format&fit=crop' },
];
function clp(n: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n || 0); }
function image(p: Product) { return p.image_url || p.img || '/omnifix-logo.svg'; }
function category(p: Product) { return p.category_name || p.category || p.category_id || 'Tecnología'; }
function pct(p: Product) { return p.discount_percentage ?? p.discountPercentage ?? 0; }
function final(p: Product) { const d = pct(p); return d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price; }
function toCart(p: Product) { return { id: p.id, name: p.name, price: p.price, image_url: image(p), category_id: category(p), discount_percentage: pct(p), stock: typeof p.stock === 'number' ? p.stock : undefined, description: p.description, shopifyVariantId: p.shopifyVariantId, shopifyProductId: p.shopifyProductId, shopifyHandle: p.shopifyHandle } as never; }

export default function OmnifixStoreClient() {
  const { products } = useCatalogProducts();
  const { addToCart, openCart, totalItems } = useCartContext();
  const [q, setQ] = useState('');
  const list = useMemo<Product[]>(() => products.length ? products as Product[] : demo, [products]);
  const filtered = useMemo(() => list.filter((p) => `${p.name} ${p.description || ''} ${category(p)}`.toLowerCase().includes(q.toLowerCase().trim())), [list, q]);
  return <main className="min-h-screen bg-[#020617] pb-32 text-white"><div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.32),transparent_34rem),radial-gradient(circle_at_90%_70%,rgba(34,211,238,.16),transparent_28rem)]" />
    <section className="relative mx-auto max-w-7xl px-4 py-6 md:px-8">
      <header className="relative flex items-center justify-center md:justify-between"><Link href="/" className="flex items-center gap-3 text-center md:text-left"><span className="grid h-16 w-16 overflow-hidden rounded-2xl bg-white md:h-12 md:w-12"><img src="/omnifix-logo.svg" alt="Omnifix" className="h-full w-full object-cover" /></span><span><b className="block text-sm font-black uppercase tracking-[.28em]">OMNIFIX</b><small className="text-blue-200/65">Catálogo tech</small></span></Link><button onClick={openCart} className="relative hidden h-12 w-12 place-items-center rounded-2xl bg-blue-400 text-black md:grid"><ShoppingBag className="h-5 w-5" />{totalItems > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-cyan-200 px-1 text-[10px] font-black">{totalItems}</span>}</button></header>
      <div className="mt-8 rounded-[2rem] border border-blue-400/15 bg-white/[.06] p-6 backdrop-blur-2xl md:p-10"><p className="text-[10px] font-black uppercase tracking-[.30em] text-cyan-200/70">Tienda Omnifix</p><h1 className="mt-4 text-5xl font-black leading-[.9] tracking-[-.07em] md:text-7xl">Productos tech, sin vueltas.</h1><p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">Compra productos, guarda tu cuenta y revisa tus pedidos. Shopify confirma pago, stock y checkout seguro.</p></div>
      <label className="sticky top-0 z-20 mt-6 flex h-14 items-center gap-3 rounded-2xl border border-blue-400/20 bg-slate-950/85 px-4 backdrop-blur-xl"><Search className="h-5 w-5 text-blue-200" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto..." className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-white/40" /></label>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{filtered.map((p) => { const ok = p.shopifyVariantId?.startsWith('gid://shopify/ProductVariant/'); return <article key={p.id} className="overflow-hidden rounded-[1.8rem] border border-blue-400/15 bg-white/[.055] backdrop-blur-xl"><div className="h-56 bg-white/5"><img src={image(p)} alt={p.name} className="h-full w-full object-cover" /></div><div className="p-5"><p className="text-[10px] font-black uppercase tracking-[.22em] text-blue-300">{category(p)}</p><h2 className="mt-2 line-clamp-2 text-xl font-black">{p.name}</h2><p className="mt-2 line-clamp-2 text-sm text-slate-400">{p.description || 'Producto seleccionado por Omnifix.'}</p><div className="mt-5 flex items-center justify-between gap-3"><b className="text-xl font-black text-blue-300">{clp(final(p))}</b><button onClick={() => addToCart(toCart(p))} disabled={Boolean(products.length) && !ok} className="rounded-full bg-blue-400 px-4 py-3 text-xs font-black uppercase text-black disabled:opacity-45">Agregar</button></div>{Boolean(products.length) && !ok && <p className="mt-3 text-xs text-blue-200/80">Producto sin variante Shopify válida.</p>}</div></article>; })}</div>
      {filtered.length === 0 && <p className="mt-8 rounded-[2rem] border border-blue-400/15 bg-white/[.055] p-8 text-center text-sm font-bold text-slate-400">No encontré productos con esa búsqueda.</p>}
    </section>
  </main>;
}
