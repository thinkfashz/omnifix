'use client';

/* eslint-disable @next/next/no-img-element */

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Bot, Grid2X2, Home, Search, ShoppingBag, Star, User, Zap } from 'lucide-react';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { useCartContext } from '@/context/CartContext';

type Product = {
  id: string;
  name: string;
  price: number;
  description?: string;
  image_url?: string;
  img?: string;
  category?: string;
  category_id?: string;
  category_name?: string;
  discount_percentage?: number;
  discountPercentage?: number;
  stock?: number;
  shopifyVariantId?: string;
  shopifyProductId?: string;
  shopifyHandle?: string;
};

const DEMO_PRODUCTS: Product[] = [
  { id: 'demo-smart-speaker', name: 'Parlante Smart Bluetooth', price: 29990, category: 'Audio', description: 'Sonido potente, conexión rápida y diseño compacto.', image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=900&auto=format&fit=crop', discount_percentage: 10, stock: 12 },
  { id: 'demo-power-bank', name: 'Power Bank 20.000 mAh', price: 21990, category: 'Carga', description: 'Energía portátil para móvil, tablet y accesorios.', image_url: 'https://images.unsplash.com/photo-1609592806596-b43bada2f8e9?q=80&w=900&auto=format&fit=crop', stock: 9 },
  { id: 'demo-security-cam', name: 'Cámara WiFi 360°', price: 34990, category: 'Seguridad', description: 'Monitoreo inteligente para casa, tienda u oficina.', image_url: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?q=80&w=900&auto=format&fit=crop', discount_percentage: 15, stock: 7 },
  { id: 'demo-keyboard', name: 'Teclado Mecánico RGB', price: 45990, category: 'Setup', description: 'Productividad y gaming con respuesta precisa.', image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=900&auto=format&fit=crop', stock: 5 },
];

function category(product: Product) { return product.category_name || product.category || product.category_id || 'Tecnología'; }
function image(product: Product) { return product.image_url || product.img || '/omnifix-logo.svg'; }
function discount(product: Product) { return product.discount_percentage ?? product.discountPercentage ?? 0; }
function finalPrice(product: Product) { const pct = discount(product); return pct > 0 ? Math.round(product.price * (1 - pct / 100)) : product.price; }
function money(value: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0); }
function toCart(product: Product) {
  return { id: product.id, name: product.name, price: product.price, image_url: image(product), category_id: category(product), discount_percentage: discount(product), stock: product.stock, description: product.description, shopifyVariantId: product.shopifyVariantId, shopifyProductId: product.shopifyProductId, shopifyHandle: product.shopifyHandle } as never;
}

export default function OmnifixHomeExperience() {
  const { products } = useCatalogProducts();
  const { addToCart, openCart, totalItems } = useCartContext();
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [query, setQuery] = useState('');
  const liveProducts = useMemo<Product[]>(() => (products.length ? products as Product[] : DEMO_PRODUCTS), [products]);
  const categories = useMemo(() => ['Todo', ...Array.from(new Set(liveProducts.map(category))).slice(0, 5)], [liveProducts]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return liveProducts.filter((product) => {
      const matchCategory = activeCategory === 'Todo' || category(product) === activeCategory;
      const matchText = !q || `${product.name} ${product.description || ''} ${category(product)}`.toLowerCase().includes(q);
      return matchCategory && matchText;
    });
  }, [activeCategory, liveProducts, query]);
  const hero = filtered[0] || liveProducts[0];
  const featured = filtered.slice(0, 6);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0f5bff] text-slate-950">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.30),transparent_30rem),radial-gradient(circle_at_80%_100%,rgba(34,211,238,.22),transparent_34rem)]" />
      <section className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 pb-28 pt-5 md:px-8 md:pb-10">
        <header className="flex items-center justify-between gap-3 text-white">
          <Link href="/" className="flex items-center gap-3"><span className="relative grid h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-[0_12px_40px_rgba(0,0,0,.20)]"><Image src="/omnifix-logo.svg" alt="Omnifix" fill sizes="48px" className="object-cover" priority /></span><span><b className="block text-sm font-black uppercase tracking-[.22em]">OMNIFIX</b><small className="text-xs text-blue-100/80">Tienda tecnológica</small></span></Link>
          <div className="flex gap-2"><Link href="/auth" className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-white backdrop-blur"><User className="h-5 w-5" /></Link><button onClick={openCart} className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white text-blue-700 shadow-[0_12px_40px_rgba(0,0,0,.16)]"><ShoppingBag className="h-5 w-5" />{totalItems > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-200 px-1 text-[10px] font-black text-blue-950">{totalItems}</span>}</button></div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[.92fr_1.08fr]">
          <div className="text-white">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[.25em] backdrop-blur"><Zap className="h-4 w-4" /> Compra rápida</p>
            <h1 className="mt-5 text-[clamp(42px,12vw,96px)] font-black leading-[.86] tracking-[-.08em]">Productos destacados para tu vida digital.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-blue-50/85">Explora tecnología, smart home, audio, carga y accesorios. Agrega al carrito, crea tu cuenta y finaliza con checkout seguro.</p>
            <div className="mt-6 flex gap-3"><Link href="/tienda" className="rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[.16em] text-blue-700">Ver catálogo</Link><Link href="/auth?mode=register" className="rounded-full border border-white/30 px-6 py-4 text-sm font-black uppercase tracking-[.16em] text-white">Crear cuenta</Link></div>
          </div>

          <div className="mx-auto w-full max-w-[420px] rounded-[2.4rem] bg-white p-4 shadow-[0_30px_90px_rgba(0,0,0,.25)] md:max-w-[470px]">
            <div className="flex items-center justify-between px-2 py-2"><button className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100"><Grid2X2 className="h-5 w-5" /></button><label className="relative flex-1 px-2"><Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar..." className="h-10 w-full rounded-2xl bg-slate-100 pl-10 pr-3 text-sm font-bold outline-none placeholder:text-slate-400" /></label><button onClick={openCart} className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white"><ShoppingBag className="h-5 w-5" /></button></div>
            <div className="relative mt-3 overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-blue-700 to-cyan-400 p-5 text-white"><div className="relative z-10 max-w-[60%]"><p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-100">Nuevo catálogo</p><h2 className="mt-2 text-2xl font-black leading-[.95]">Tecnología lista para comprar</h2><Link href="/tienda" className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-blue-700">Explorar</Link></div>{hero && <img src={image(hero)} alt={hero.name} className="absolute -right-5 bottom-0 h-36 w-40 rotate-[-8deg] object-contain drop-shadow-2xl" />}</div>
            <div className="mt-5"><h3 className="text-xl font-black">Categorías</h3><div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{categories.map((item) => <button key={item} onClick={() => setActiveCategory(item)} className={`shrink-0 rounded-xl px-4 py-3 text-xs font-black transition ${activeCategory === item ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,.25)]' : 'bg-slate-100 text-slate-500'}`}>{item}</button>)}</div></div>
            <div className="mt-5"><div className="flex items-center justify-between"><h3 className="text-xl font-black">Popular</h3><Link href="/tienda" className="text-xs font-black text-blue-600">Ver todo</Link></div><div className="mt-3 grid grid-cols-2 gap-3">{featured.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} onAdd={() => addToCart(toCart(product))} />)}</div></div>
          </div>
        </div>
      </section>

      <nav className="fixed inset-x-3 bottom-3 z-[200] mx-auto max-w-md rounded-[1.7rem] bg-white/95 p-2 shadow-[0_18px_60px_rgba(0,0,0,.28)] backdrop-blur-2xl md:hidden">
        <div className="grid grid-cols-5 items-center gap-1 text-slate-400"><Link href="/" className="grid h-12 place-items-center rounded-2xl text-blue-600"><Home className="h-5 w-5" /></Link><Link href="/tienda" className="grid h-12 place-items-center rounded-2xl"><Grid2X2 className="h-5 w-5" /></Link><button onClick={openCart} className="relative mx-auto -mt-8 grid h-16 w-16 place-items-center rounded-full bg-blue-600 text-white shadow-[0_16px_40px_rgba(37,99,235,.42)]"><ShoppingBag className="h-6 w-6" />{totalItems > 0 && <span className="absolute -right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-cyan-200 px-1 text-[10px] font-black text-blue-950">{totalItems}</span>}</button><Link href="/auth" className="grid h-12 place-items-center rounded-2xl"><User className="h-5 w-5" /></Link><Link href="/tienda?buscar=1" className="grid h-12 place-items-center rounded-2xl"><Search className="h-5 w-5" /></Link></div>
      </nav>
    </main>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return <article className="rounded-[1.35rem] bg-slate-50 p-2 shadow-[0_12px_28px_rgba(15,23,42,.08)]"><div className="relative h-28 overflow-hidden rounded-[1rem] bg-white"><img src={image(product)} alt={product.name} className="h-full w-full object-cover" />{discount(product) > 0 && <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-1 text-[10px] font-black text-white">-{discount(product)}%</span>}</div><div className="px-1.5 pb-1 pt-3"><p className="text-[9px] font-black uppercase tracking-[.18em] text-blue-500">{category(product)}</p><h4 className="mt-1 line-clamp-2 min-h-[2.3rem] text-sm font-black leading-tight text-slate-950">{product.name}</h4><div className="mt-2 flex items-center justify-between gap-2"><div><span className="block text-sm font-black text-slate-950">{money(finalPrice(product))}</span><span className="flex items-center gap-1 text-[10px] text-slate-400"><Star className="h-3 w-3 fill-blue-500 text-blue-500" /> 5.0</span></div><button onClick={onAdd} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,.28)]"><ShoppingBag className="h-4 w-4" /></button></div></div></article>;
}
