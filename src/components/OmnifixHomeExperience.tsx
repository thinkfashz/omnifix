'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, ShoppingBag, Star, Zap } from 'lucide-react';
import FabrickLogo from '@/components/FabrickLogo';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { useCartContext } from '@/context/CartContext';
import { OMNIFIX_EXTRA_PRODUCTS } from '@/lib/omnifixExtraProducts';

type Product = { id: string; name: string; price: number; description?: string; image_url?: string; img?: string; category?: string; category_id?: string; category_name?: string; discount_percentage?: number; discountPercentage?: number; stock?: number; shopifyVariantId?: string; shopifyProductId?: string; shopifyHandle?: string; rating?: number; tagline?: string; features?: string[]; delivery?: string };

function category(product: Product) { return product.category_name || product.category || product.category_id || 'Tecnología'; }
function image(product: Product) { return product.image_url || product.img || '/omnifix-logo.svg'; }
function discount(product: Product) { return product.discount_percentage ?? product.discountPercentage ?? 0; }
function finalPrice(product: Product) { const pct = discount(product); return pct > 0 ? Math.round(product.price * (1 - pct / 100)) : product.price; }
function money(value: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0); }
function toCart(product: Product) { return { id: product.id, name: product.name, price: product.price, image_url: image(product), category_id: category(product), discount_percentage: discount(product), stock: product.stock, description: product.description, shopifyVariantId: product.shopifyVariantId, shopifyProductId: product.shopifyProductId, shopifyHandle: product.shopifyHandle } as never; }
function productHref(product: Product) { return `/producto/${encodeURIComponent(product.id)}`; }

export default function OmnifixHomeExperience() {
  const { products } = useCatalogProducts();
  const { addToCart } = useCartContext();
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [query, setQuery] = useState('');
  const liveProducts = useMemo<Product[]>(() => {
    const map = new Map<string, Product>();
    [...(products as Product[]), ...(OMNIFIX_EXTRA_PRODUCTS as Product[])].forEach((product) => map.set(product.id, product));
    return Array.from(map.values());
  }, [products]);
  const categories = useMemo(() => ['Todo', ...Array.from(new Set(liveProducts.map(category))).slice(0, 8)], [liveProducts]);
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return liveProducts.filter((product) => (activeCategory === 'Todo' || category(product) === activeCategory) && (!q || `${product.name} ${product.description || ''} ${category(product)}`.toLowerCase().includes(q))); }, [activeCategory, liveProducts, query]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0f5bff] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.28),transparent_30rem),radial-gradient(circle_at_80%_100%,rgba(34,211,238,.20),transparent_34rem)]" />
      <section className="relative mx-auto max-w-7xl px-4 pt-5 md:px-8">
        <header className="flex items-center justify-center py-2">
          <Link href="/" className="flex items-center justify-center text-center">
            <FabrickLogo className="pointer-events-none" />
          </Link>
        </header>

        <div className="py-8 md:py-12">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[.25em] backdrop-blur"><Zap className="h-4 w-4" /> Compra rápida</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(42px,13vw,88px)] font-black leading-[.86] tracking-[-.08em]">Tecnología lista para comprar.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50/88">Toca cualquier producto para abrir su ficha, ver detalles y pasar directo al checkout.</p>
        </div>
      </section>

      <section className="relative rounded-t-[2.4rem] bg-white px-4 pb-10 pt-6 text-slate-950 md:px-8 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-blue-600">Catálogo Omnifix</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em] md:text-5xl">Productos</h2></div>
            <label className="relative block w-full md:max-w-md"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto..." className="h-14 w-full rounded-2xl bg-slate-100 pl-12 pr-4 text-sm font-black outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500" /></label>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{categories.map((item) => <button key={item} onClick={() => setActiveCategory(item)} className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-black transition ${activeCategory === item ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,.25)]' : 'bg-slate-100 text-slate-500'}`}>{item}</button>)}</div>
          <div className="mt-6 grid auto-cols-[155px] grid-flow-col grid-rows-2 gap-3 overflow-x-auto pb-3 [scrollbar-width:none] sm:auto-cols-[185px] md:auto-cols-auto md:grid-flow-row md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={() => addToCart(toCart(product))} />)}</div>
          {filtered.length === 0 && <div className="mt-8 rounded-[2rem] bg-slate-50 p-10 text-center text-slate-500">No encontré productos con esa búsqueda.</div>}
        </div>
      </section>
    </main>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return <article className="overflow-hidden rounded-[1.25rem] bg-slate-50 shadow-[0_10px_28px_rgba(15,23,42,.08)] ring-1 ring-slate-200"><Link href={productHref(product)} className="block"><div className="relative h-28 overflow-hidden bg-white sm:h-32"><img src={image(product)} alt={product.name} className="h-full w-full object-cover" />{discount(product) > 0 && <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-[9px] font-black text-white">-{discount(product)}%</span>}</div><div className="p-3"><p className="text-[8px] font-black uppercase tracking-[.16em] text-blue-500">{category(product)}</p><h4 className="mt-1 line-clamp-2 min-h-[2.2rem] text-sm font-black leading-tight text-slate-950">{product.name}</h4><div className="mt-2"><span className="block text-base font-black text-blue-700">{money(finalPrice(product))}</span><span className="flex items-center gap-1 text-[10px] text-slate-400"><Star className="h-3 w-3 fill-blue-500 text-blue-500" /> {product.rating || 5}.0</span></div></div></Link><div className="px-3 pb-3"><button onClick={onAdd} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-blue-600 text-[10px] font-black uppercase tracking-[.12em] text-white shadow-[0_10px_20px_rgba(37,99,235,.24)]"><ShoppingBag className="h-4 w-4" /> Agregar</button></div></article>;
}
