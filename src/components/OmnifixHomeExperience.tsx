'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, ShoppingBag, Star, Zap } from 'lucide-react';
import FabrickLogo from '@/components/FabrickLogo';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { useCartContext } from '@/context/CartContext';

type Product = { id: string; name: string; price: number; description?: string; image_url?: string; img?: string; category?: string; category_id?: string; category_name?: string; discount_percentage?: number; discountPercentage?: number; stock?: number; shopifyVariantId?: string; shopifyProductId?: string; shopifyHandle?: string };

const DEMO_PRODUCTS: Product[] = [
  { id: 'demo-smart-speaker', name: 'Parlante Smart Bluetooth', price: 29990, category: 'Audio', description: 'Sonido potente, conexión rápida y diseño compacto.', image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=900&auto=format&fit=crop', discount_percentage: 10, stock: 12 },
  { id: 'demo-power-bank', name: 'Power Bank 20.000 mAh', price: 21990, category: 'Carga', description: 'Energía portátil para móvil, tablet y accesorios.', image_url: 'https://images.unsplash.com/photo-1609592806596-b43bada2f8e9?q=80&w=900&auto=format&fit=crop', stock: 9 },
  { id: 'demo-security-cam', name: 'Cámara WiFi 360°', price: 34990, category: 'Smart Home', description: 'Monitoreo inteligente para casa, tienda u oficina.', image_url: 'https://images.unsplash.com/photo-1580983218765-f663bec07b37?q=80&w=900&auto=format&fit=crop', discount_percentage: 15, stock: 7 },
  { id: 'demo-keyboard', name: 'Teclado Mecánico RGB', price: 45990, category: 'Setup', description: 'Productividad y gaming con respuesta precisa.', image_url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=900&auto=format&fit=crop', stock: 5 },
  { id: 'demo-camera', name: 'Cámara WiFi interior', price: 32990, category: 'Seguridad', description: 'Visualiza espacios desde tu móvil.', image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=900&auto=format&fit=crop', stock: 8 },
  { id: 'demo-charger', name: 'Cargador USB-C rápido', price: 15990, category: 'Carga', description: 'Carga rápida para móvil y tablet.', image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=900&auto=format&fit=crop', stock: 20 },
];

function category(product: Product) { return product.category_name || product.category || product.category_id || 'Tecnología'; }
function image(product: Product) { return product.image_url || product.img || '/omnifix-logo.svg'; }
function discount(product: Product) { return product.discount_percentage ?? product.discountPercentage ?? 0; }
function finalPrice(product: Product) { const pct = discount(product); return pct > 0 ? Math.round(product.price * (1 - pct / 100)) : product.price; }
function money(value: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0); }
function toCart(product: Product) { return { id: product.id, name: product.name, price: product.price, image_url: image(product), category_id: category(product), discount_percentage: discount(product), stock: product.stock, description: product.description, shopifyVariantId: product.shopifyVariantId, shopifyProductId: product.shopifyProductId, shopifyHandle: product.shopifyHandle } as never; }

export default function OmnifixHomeExperience() {
  const { products } = useCatalogProducts();
  const { addToCart, openCart, totalItems } = useCartContext();
  const [activeCategory, setActiveCategory] = useState('Todo');
  const [query, setQuery] = useState('');
  const liveProducts = useMemo<Product[]>(() => (products.length ? products as Product[] : DEMO_PRODUCTS), [products]);
  const categories = useMemo(() => ['Todo', ...Array.from(new Set(liveProducts.map(category))).slice(0, 6)], [liveProducts]);
  const filtered = useMemo(() => { const q = query.trim().toLowerCase(); return liveProducts.filter((product) => (activeCategory === 'Todo' || category(product) === activeCategory) && (!q || `${product.name} ${product.description || ''} ${category(product)}`.toLowerCase().includes(q))); }, [activeCategory, liveProducts, query]);

  return (
    <main className="min-h-screen overflow-hidden bg-[#0f5bff] pb-28 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,.30),transparent_30rem),radial-gradient(circle_at_80%_100%,rgba(34,211,238,.22),transparent_34rem)]" />
      <section className="relative mx-auto max-w-7xl px-4 pt-5 md:px-8">
        <header className="relative flex items-center justify-center md:justify-between">
          <Link href="/" className="flex items-center justify-center text-center md:justify-start md:text-left">
            <FabrickLogo className="pointer-events-none" />
          </Link>
          <div className="hidden gap-2 md:flex"><Link href="/auth" className="rounded-full border border-white/20 px-5 py-3 text-xs font-black uppercase tracking-[.16em] text-white">Cuenta</Link><button onClick={openCart} className="relative rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[.16em] text-blue-700">Carrito{totalItems > 0 && <span className="ml-2 rounded-full bg-cyan-200 px-2 py-0.5 text-blue-950">{totalItems}</span>}</button></div>
        </header>

        <div className="py-10 md:py-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-[10px] font-black uppercase tracking-[.25em] backdrop-blur"><Zap className="h-4 w-4" /> Compra rápida</p>
          <h1 className="mt-5 max-w-4xl text-[clamp(42px,13vw,96px)] font-black leading-[.86] tracking-[-.08em]">Tecnología para tu vida digital.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-blue-50/88">Explora smart home, audio, carga y accesorios. Agrega al carrito, crea tu cuenta y finaliza con checkout seguro.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/tienda" className="rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[.16em] text-blue-700">Ver catálogo</Link><Link href="/auth?mode=register" className="rounded-full border border-white/30 px-6 py-4 text-sm font-black uppercase tracking-[.16em] text-white">Crear cuenta</Link></div>
        </div>
      </section>

      <section className="relative bg-white px-4 pb-32 pt-6 text-slate-950 md:px-8 md:pb-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[.28em] text-blue-600">Catálogo Omnifix</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em] md:text-5xl">Productos tecnológicos</h2></div>
            <label className="relative block w-full md:max-w-md"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto..." className="h-14 w-full rounded-2xl bg-slate-100 pl-12 pr-4 text-sm font-black outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500" /></label>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{categories.map((item) => <button key={item} onClick={() => setActiveCategory(item)} className={`shrink-0 rounded-2xl px-4 py-3 text-xs font-black transition ${activeCategory === item ? 'bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,.25)]' : 'bg-slate-100 text-slate-500'}`}>{item}</button>)}</div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={() => addToCart(toCart(product))} />)}</div>
          {filtered.length === 0 && <div className="mt-8 rounded-[2rem] bg-slate-50 p-10 text-center text-slate-500">No encontré productos con esa búsqueda.</div>}
        </div>
      </section>
    </main>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return <article className="overflow-hidden rounded-[1.5rem] bg-slate-50 shadow-[0_12px_34px_rgba(15,23,42,.08)] ring-1 ring-slate-200"><div className="relative h-44 overflow-hidden bg-white"><img src={image(product)} alt={product.name} className="h-full w-full object-cover" />{discount(product) > 0 && <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black text-white">-{discount(product)}%</span>}</div><div className="p-4"><p className="text-[9px] font-black uppercase tracking-[.18em] text-blue-500">{category(product)}</p><h4 className="mt-1 line-clamp-2 min-h-[2.6rem] text-base font-black leading-tight text-slate-950">{product.name}</h4><p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs leading-5 text-slate-500">{product.description || 'Producto seleccionado por Omnifix.'}</p><div className="mt-4 flex items-center justify-between gap-2"><div><span className="block text-lg font-black text-blue-700">{money(finalPrice(product))}</span><span className="flex items-center gap-1 text-[10px] text-slate-400"><Star className="h-3 w-3 fill-blue-500 text-blue-500" /> 5.0</span></div><button onClick={onAdd} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-[0_10px_20px_rgba(37,99,235,.28)]"><ShoppingBag className="h-4 w-4" /></button></div></div></article>;
}
