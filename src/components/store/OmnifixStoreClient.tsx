'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Grid2X2, Heart, Home, Search, ShoppingBag, SlidersHorizontal, Star, TrendingUp, User } from 'lucide-react';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { useCartContext } from '@/context/CartContext';
import { OMNIFIX_EXTRA_PRODUCTS } from '@/lib/omnifixExtraProducts';
import StoreNavbar from '@/components/store/StoreNavbar';
import StoreFooter from '@/components/store/StoreFooter';

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
  stock?: number | string;
  discount_percentage?: number;
  discountPercentage?: number;
  shopifyVariantId?: string;
  shopifyProductId?: string;
  shopifyHandle?: string;
  source?: string;
  rating?: number;
  tagline?: string;
};

const CATEGORY_LABELS = ['Todo', 'Computadores', 'Audio', 'Smart Home', 'Accesorios'];

function clp(n: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n || 0);
}
function image(p: Product) { return p.image_url || p.img || '/omnifix-logo.svg'; }
function category(p: Product) { return p.category_name || p.category || p.category_id || 'Tecnología'; }
function pct(p: Product) { return p.discount_percentage ?? p.discountPercentage ?? 0; }
function final(p: Product) {
  const discount = pct(p);
  return discount > 0 ? Math.round(p.price * (1 - discount / 100)) : p.price;
}
function href(p: Product) { return `/producto/${encodeURIComponent(p.id)}`; }
function toCart(p: Product) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    image_url: image(p),
    category_id: category(p),
    discount_percentage: pct(p),
    stock: typeof p.stock === 'number' ? p.stock : undefined,
    description: p.description,
    shopifyVariantId: p.shopifyVariantId,
    shopifyProductId: p.shopifyProductId,
    shopifyHandle: p.shopifyHandle,
  } as never;
}
function labelFor(p: Product) {
  const c = category(p).toLowerCase();
  if (c.includes('comput') || c.includes('notebook') || c.includes('laptop')) return 'Laptop';
  if (c.includes('audio') || c.includes('auricular')) return 'Audio';
  if (c.includes('smart')) return 'Smart Home';
  if (c.includes('carga') || c.includes('acces')) return 'Accesorio';
  return category(p);
}

export default function OmnifixStoreClient() {
  const { products } = useCatalogProducts();
  const { addToCart, openCart, totalItems } = useCartContext();
  const [q, setQ] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todo');

  const list = useMemo<Product[]>(() => {
    const map = new Map<string, Product>();
    [...(products as Product[]), ...(OMNIFIX_EXTRA_PRODUCTS as Product[])].forEach((product) => map.set(product.id, product));
    return Array.from(map.values());
  }, [products]);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    return list.filter((p) => {
      const rawCategory = category(p).toLowerCase();
      const normalized = selectedCategory.toLowerCase();
      const text = `${p.name} ${p.description || ''} ${rawCategory}`.toLowerCase();
      const matchesCategory = selectedCategory === 'Todo'
        || rawCategory.includes(normalized)
        || (normalized === 'audio' && text.includes('audio'))
        || (normalized === 'computadores' && Boolean(text.match(/notebook|laptop|comput|pc/)))
        || (normalized === 'accesorios' && Boolean(text.match(/acces|carga|hub|mouse|soporte|power/)));
      const matchesSearch = !term || text.includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [list, q, selectedCategory]);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#0C0516] text-white">
      <ItcolorBackground />
      <div className="relative z-10 mx-auto max-w-3xl md:my-8">
        <div className="min-h-screen overflow-hidden bg-[rgba(12,5,22,.30)] shadow-[0_34px_120px_rgba(12,5,22,.45)] backdrop-blur-[2px] md:rounded-[2.2rem]">
          <StoreNavbar />

          <nav className="sticky top-0 z-20 mx-5 mt-4 flex gap-7 overflow-x-auto rounded-[1.35rem] border border-white/10 bg-white/[0.10] px-5 text-[15px] font-semibold text-white/78 shadow-[0_14px_44px_rgba(12,5,22,.22)] backdrop-blur-2xl [scrollbar-width:none]">
            {CATEGORY_LABELS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setSelectedCategory(item)}
                className={`relative shrink-0 py-4 transition ${selectedCategory === item ? 'text-white' : 'text-white/62 hover:text-white'}`}
              >
                {item}
                {selectedCategory === item ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#7F3AA1] shadow-[0_0_18px_rgba(127,58,161,.9)]" /> : null}
              </button>
            ))}
          </nav>

          <section className="px-5 pb-28 pt-5 md:px-7">
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.11] px-7 py-7 text-white shadow-[0_24px_70px_rgba(84,22,181,.28)] backdrop-blur-2xl sm:px-9">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(127,58,161,.34),rgba(84,22,181,.28)_48%,rgba(15,8,59,.30))]" />
              <div className="absolute -right-10 bottom-0 top-3 w-[54%] opacity-95">
                <img src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1000&auto=format&fit=crop" alt="Notebook Omnifix" className="h-full w-full rounded-l-[2rem] object-cover object-center mix-blend-screen" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,255,255,.22),transparent_45%),linear-gradient(90deg,#0C0516_0%,transparent_58%)]" />
              </div>
              <div className="relative max-w-[58%]">
                <p className="inline-flex rounded-full bg-white/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.20em] text-white/82">Bienvenido a Omnifix</p>
                <h1 className="mt-4 text-[34px] font-black leading-[0.96] tracking-[-0.04em] sm:text-5xl">Hasta 30% de descuento</h1>
                <p className="mt-3 max-w-xs text-sm font-medium leading-5 text-white/78 sm:text-base">Ofertas en tecnología seleccionada.</p>
                <a href="#catalogo" className="mt-5 inline-flex h-12 items-center gap-3 rounded-2xl bg-white px-5 text-sm font-black text-[#0C0516] shadow-[0_12px_24px_rgba(255,255,255,.16)] transition active:scale-95">
                  Comprar ahora <ArrowRight className="h-4 w-4 text-[#5416B5]" />
                </a>
              </div>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                <span className="h-2 w-7 rounded-full bg-white" />
                <span className="h-2 w-2 rounded-full bg-white/35" />
                <span className="h-2 w-2 rounded-full bg-white/35" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-[1.25rem] border border-white/10 bg-white/[0.10] px-5 py-4 text-white/78 shadow-[0_12px_34px_rgba(12,5,22,.22)] backdrop-blur-2xl">
              <button type="button" className="flex items-center gap-3 text-[15px] font-semibold"><SlidersHorizontal className="h-5 w-5" /> Filtrar <ChevronDown className="h-4 w-4" /></button>
              <span className="h-7 w-px bg-white/16" />
              <button type="button" className="flex items-center gap-3 text-[15px] font-semibold"><TrendingUp className="h-5 w-5" /> Popular <ChevronDown className="h-4 w-4" /></button>
            </div>

            <label id="catalogo" className="mt-5 flex h-12 items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.10] px-4 text-white shadow-[0_10px_28px_rgba(12,5,22,.20)] backdrop-blur-2xl">
              <Search className="h-5 w-5 text-white/56" />
              <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar producto..." className="h-full min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/45" />
            </label>

            <div className="mt-5 grid grid-cols-2 gap-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} onAdd={() => addToCart(toCart(p))} />)}
            </div>
            {filtered.length === 0 ? <p className="mt-8 rounded-[1.4rem] border border-white/10 bg-white/[0.10] p-8 text-center text-sm font-bold text-white/62 backdrop-blur-2xl">No encontré productos con esa búsqueda.</p> : null}
          </section>

          <StoreFooter />
          <BottomNav totalItems={totalItems} openCart={openCart} />
        </div>
      </div>
    </main>
  );
}

function ItcolorBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-itcolor-gradient" />
      <div className="absolute inset-0 bg-[rgba(12,5,22,.30)]" />
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#7F3AA1]/35 blur-3xl animate-itcolor-float-slow" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#5416B5]/35 blur-3xl animate-itcolor-float-slower" />
      <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(127,58,161,0.28),rgba(84,22,181,0.18),transparent_68%)] blur-2xl animate-itcolor-wave-one" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle_at_center,rgba(84,22,181,0.14),rgba(15,8,59,0.08),transparent_72%)] blur-3xl animate-itcolor-wave-two" />
      <div className="absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,8,59,0.14),transparent_70%)] blur-3xl animate-itcolor-wave-three" />
    </div>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const needsShopifyVariant = product.source === 'shopify' || Boolean(product.shopifyProductId || product.shopifyHandle);
  const ok = product.shopifyVariantId?.startsWith('gid://shopify/ProductVariant/');

  return (
    <article className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/[0.12] shadow-[0_16px_36px_rgba(12,5,22,.24)] backdrop-blur-2xl">
      <Link href={href(product)} className="block">
        <div className="relative aspect-square bg-white/84">
          <img src={image(product)} alt={product.name} className="h-full w-full object-contain p-4 transition duration-500 hover:scale-105" />
          <button type="button" aria-label="Favorito" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/80 text-[#5416B5] backdrop-blur"><Heart className="h-5 w-5" /></button>
          {pct(product) > 0 ? <span className="absolute left-3 top-3 rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#5416B5] shadow-sm">-{pct(product)}%</span> : null}
        </div>
        <div className="px-4 pb-3 pt-4">
          <h3 className="line-clamp-2 min-h-[2.6rem] text-[15px] font-black leading-tight text-white">{product.name}</h3>
          <p className="mt-1 line-clamp-1 text-[13px] font-medium text-white/56">{labelFor(product)}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-[17px] font-black tracking-[-0.03em] text-white">{clp(final(product))}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/62"><Star className="h-3.5 w-3.5 fill-[#7F3AA1] text-[#7F3AA1]" /> {product.rating || 4.8}</span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button onClick={onAdd} disabled={needsShopifyVariant && !ok} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-[linear-gradient(135deg,#7F3AA1_0%,#5416B5_56%,#0F083B_100%)] text-sm font-black text-white shadow-[0_12px_26px_rgba(84,22,181,.32)] transition hover:brightness-110 disabled:opacity-45">
          <ShoppingBag className="h-4 w-4" /> Añadir
        </button>
      </div>
    </article>
  );
}

function BottomNav({ totalItems, openCart }: { totalItems: number; openCart: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-3xl px-4 pb-3 md:bottom-8 md:px-8">
      <div className="grid grid-cols-4 rounded-t-[1.8rem] rounded-b-[1.4rem] border border-white/10 bg-white/[0.12] px-5 py-3 text-white/58 shadow-[0_-14px_40px_rgba(12,5,22,.24)] backdrop-blur-2xl">
        <Link href="/" className="flex flex-col items-center gap-1 text-white"><Home className="h-6 w-6 fill-white/10" /><span className="text-xs font-bold">Inicio</span></Link>
        <a href="#catalogo" className="flex flex-col items-center gap-1"><Grid2X2 className="h-6 w-6" /><span className="text-xs font-bold">Categorías</span></a>
        <button type="button" onClick={openCart} className="relative flex flex-col items-center gap-1"><ShoppingBag className="h-6 w-6" />{totalItems > 0 ? <span className="absolute -top-2 right-[26%] grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-black text-[#5416B5]">{totalItems}</span> : null}<span className="text-xs font-bold">Carrito</span></button>
        <Link href="/auth" className="flex flex-col items-center gap-1"><User className="h-6 w-6" /><span className="text-xs font-bold">Cuenta</span></Link>
      </div>
    </nav>
  );
}
