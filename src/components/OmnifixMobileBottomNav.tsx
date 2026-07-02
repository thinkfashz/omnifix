'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Grid2X2, Home, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { useCartContext } from '@/context/CartContext';
import { OMNIFIX_EXTRA_PRODUCTS } from '@/lib/omnifixExtraProducts';

type Product = { id: string; name: string; price: number; description?: string; image_url?: string; img?: string; category?: string; category_id?: string; category_name?: string; discount_percentage?: number; discountPercentage?: number; stock?: number; shopifyVariantId?: string; shopifyProductId?: string; shopifyHandle?: string };

const hiddenRoutes = ['/', '/admin', '/auth', '/checkout', '/presupuestos', '/p/'];

function category(p: Product) { return p.category_name || p.category || p.category_id || 'Tecnología'; }
function image(p: Product) { return p.image_url || p.img || '/omnifix-logo.svg'; }
function discount(p: Product) { return p.discount_percentage ?? p.discountPercentage ?? 0; }
function price(p: Product) { const d = discount(p); return d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price; }
function clp(n: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n || 0); }
function toCart(p: Product) { return { id: p.id, name: p.name, price: p.price, image_url: image(p), category_id: category(p), discount_percentage: discount(p), stock: p.stock, description: p.description, shopifyVariantId: p.shopifyVariantId, shopifyProductId: p.shopifyProductId, shopifyHandle: p.shopifyHandle } as never; }
function href(p: Product) { return `/producto/${encodeURIComponent(p.id)}`; }

export default function OmnifixMobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { products } = useCatalogProducts();
  const { addToCart, openCart, totalItems } = useCartContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState('');
  const list = useMemo<Product[]>(() => {
    const map = new Map<string, Product>();
    [...(products as Product[]), ...(OMNIFIX_EXTRA_PRODUCTS as Product[])].forEach((product) => map.set(product.id, product));
    return Array.from(map.values());
  }, [products]);
  const results = useMemo(() => { const term = q.trim().toLowerCase(); if (!term) return list.slice(0, 10); return list.filter((p) => `${p.name} ${p.description || ''} ${category(p)}`.toLowerCase().includes(term)).slice(0, 14); }, [list, q]);

  if (!pathname || hiddenRoutes.some((route) => route === '/' ? pathname === '/' : pathname.startsWith(route))) return null;

  const active = (path: string) => pathname === path || (path !== '/' && pathname.startsWith(path));

  return (
    <>
      {searchOpen && (
        <div className="fixed inset-0 z-[9300] bg-slate-950/72 backdrop-blur-xl md:hidden">
          <section className="absolute inset-x-3 bottom-24 max-h-[78dvh] overflow-hidden rounded-[2rem] border border-blue-300/20 bg-white text-slate-950 shadow-[0_24px_90px_rgba(0,0,0,.36)]">
            <div className="flex items-center gap-3 border-b border-slate-100 p-4"><Search className="h-5 w-5 text-blue-600" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos Omnifix..." className="h-11 min-w-0 flex-1 rounded-2xl bg-slate-100 px-4 text-sm font-black outline-none placeholder:text-slate-400" /><button onClick={() => setSearchOpen(false)} className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-500"><X className="h-5 w-5" /></button></div>
            <div className="max-h-[calc(78dvh-78px)] space-y-3 overflow-y-auto p-4 pb-6">{results.map((p) => <article key={p.id} onClick={() => { setSearchOpen(false); router.push(href(p)); }} className="flex cursor-pointer gap-3 rounded-[1.25rem] bg-slate-50 p-2 ring-1 ring-slate-200"><img src={image(p)} alt={p.name} className="h-20 w-20 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-500">{category(p)}</p><h3 className="line-clamp-2 text-sm font-black leading-tight">{p.name}</h3><div className="mt-2 flex items-center justify-between gap-2"><b className="text-sm text-blue-700">{clp(price(p))}</b><button onClick={(event) => { event.stopPropagation(); addToCart(toCart(p)); }} className="rounded-full bg-blue-600 px-3 py-2 text-[10px] font-black uppercase text-white">Agregar</button></div></div></article>)}{results.length === 0 && <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm font-bold text-slate-500">No encontré productos con esa búsqueda.</p>}</div>
          </section>
        </div>
      )}
      <nav className="fixed inset-x-3 bottom-3 z-[9200] mx-auto max-w-md rounded-[1.7rem] border border-blue-100/80 bg-white/96 p-2 shadow-[0_18px_60px_rgba(15,23,42,.28)] backdrop-blur-2xl md:hidden">
        <div className="grid grid-cols-5 items-center gap-1 text-slate-400"><Link href="/" className={`grid h-12 place-items-center rounded-2xl ${active('/') ? 'text-blue-600' : ''}`} aria-label="Inicio"><Home className="h-5 w-5" /></Link><Link href="/tienda" className={`grid h-12 place-items-center rounded-2xl ${active('/tienda') ? 'text-blue-600' : ''}`} aria-label="Catálogo"><Grid2X2 className="h-5 w-5" /></Link><button onClick={openCart} className="relative mx-auto -mt-8 grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-white shadow-[0_16px_40px_rgba(37,99,235,.42)]" aria-label="Carrito"><ShoppingBag className="h-6 w-6" />{totalItems > 0 && <span className="absolute -right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-200 px-1 text-[10px] font-black text-blue-950">{totalItems}</span>}</button><button onClick={() => setSearchOpen(true)} className="grid h-12 place-items-center rounded-2xl" aria-label="Buscar productos"><Search className="h-5 w-5" /></button><Link href="/auth" className="grid h-12 place-items-center rounded-2xl" aria-label="Usuario"><User className="h-5 w-5" /></Link></div>
      </nav>
    </>
  );
}
