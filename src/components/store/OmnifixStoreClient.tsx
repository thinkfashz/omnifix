'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CreditCard, Search, ShoppingBag, Sparkles, Star } from 'lucide-react';
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

  const categories = useMemo(() => ['Todo', ...Array.from(new Set(list.map(category))).slice(0, 8)], [list]);
  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    return list.filter((p) => {
      const matchesCategory = selectedCategory === 'Todo' || category(p) === selectedCategory;
      const matchesSearch = !term || `${p.name} ${p.description || ''} ${category(p)}`.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [list, q, selectedCategory]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,.18),transparent_22rem),radial-gradient(circle_at_80%_14%,rgba(96,165,250,.26),transparent_28rem),radial-gradient(circle_at_52%_88%,rgba(219,234,254,.13),transparent_32rem),linear-gradient(180deg,#07111f_0%,#0b1c33_43%,#061020_100%)]" />
        <div className="absolute -left-28 top-6 h-[30rem] w-[30rem] rounded-full bg-white/8 blur-[105px] omni-float-slow" />
        <div className="absolute right-[-10rem] top-[18%] h-[34rem] w-[34rem] rounded-full bg-blue-400/18 blur-[120px] omni-float-medium" />
        <div className="absolute bottom-[-14rem] left-[8%] h-[30rem] w-[30rem] rounded-full bg-white/8 blur-[130px] omni-float-fast" />
      </div>

      <StoreNavbar cartCount={totalItems} onCartToggle={openCart} />

      <section className="relative z-10 px-5 pb-10 pt-7 md:px-8 md:pt-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-8 md:grid-cols-[0.94fr_1.06fr] md:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/[0.07] px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-blue-100/85 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" /> Omnifix Store
              </p>
              <h1 className="mt-5 max-w-2xl text-[clamp(42px,11vw,92px)] font-black leading-[0.88] tracking-[-0.085em] text-white">
                Tecnología premium para comprar hoy.
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-8 text-blue-50/68 md:text-base">
                Explora productos tecnológicos, abre cada ficha, revisa detalles y compra con una experiencia limpia tipo app.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#catalogo" className="inline-flex h-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f8fbff,#a6c8ff_48%,#2563eb)] px-7 text-sm font-black uppercase tracking-[0.16em] text-[#061326] shadow-[0_18px_44px_rgba(37,99,235,.28)] transition hover:-translate-y-0.5">
                  Ver catálogo
                </a>
                <button onClick={openCart} className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.07] px-7 text-sm font-black uppercase tracking-[0.16em] text-white/90 backdrop-blur transition hover:bg-white/[0.13]">
                  <ShoppingBag className="h-4 w-4" /> Carrito
                </button>
              </div>
            </div>

            <div className="relative min-h-[300px] md:min-h-[480px]">
              <div className="absolute inset-0 rounded-[3.25rem] bg-[radial-gradient(circle_at_38%_18%,rgba(255,255,255,.30),transparent_18rem),radial-gradient(circle_at_80%_80%,rgba(37,99,235,.24),transparent_22rem)] blur-2xl" />
              <div className="relative min-h-[300px] overflow-hidden rounded-[2.6rem] shadow-[0_34px_110px_rgba(0,0,0,.32)] md:min-h-[480px]">
                <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1400&auto=format&fit=crop" alt="Computador premium Omnifix" className="h-full min-h-[300px] w-full object-cover opacity-90 md:min-h-[480px]" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,31,.08),transparent_45%,rgba(255,255,255,.14)),linear-gradient(0deg,rgba(7,17,31,.28),transparent_45%)]" />
              </div>
            </div>
          </div>

          <div className="h-16 md:h-20" />

          <section id="catalogo" className="relative">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.30em] text-blue-100/58">Catálogo Omnifix</p>
                <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] text-white md:text-6xl">Productos</h2>
              </div>
              <label className="relative block w-full md:max-w-md">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-100/66" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto..." className="h-14 w-full rounded-full border border-white/10 bg-white/[0.075] pl-12 pr-4 text-sm font-bold text-white outline-none backdrop-blur-xl placeholder:text-white/35 focus:border-blue-200/45 focus:bg-white/[0.12]" />
              </label>
            </div>

            <div className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {categories.map((item) => (
                <button key={item} onClick={() => setSelectedCategory(item)} className={`shrink-0 rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] transition ${selectedCategory === item ? 'bg-white text-blue-700 shadow-[0_12px_30px_rgba(255,255,255,.13)]' : 'bg-white/[0.065] text-white/58 backdrop-blur-xl hover:bg-white/[0.10] hover:text-white'}`}>
                  {item}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((p) => <ProductCard key={p.id} product={p} onAdd={() => addToCart(toCart(p))} />)}
            </div>
            {filtered.length === 0 && <p className="mt-8 rounded-[1.7rem] bg-white/[0.07] p-8 text-center text-sm font-bold text-white/56 backdrop-blur-xl">No encontré productos con esa búsqueda.</p>}
          </section>
        </div>
      </section>

      <StoreFooter />
    </main>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const needsShopifyVariant = product.source === 'shopify' || Boolean(product.shopifyProductId || product.shopifyHandle);
  const ok = product.shopifyVariantId?.startsWith('gid://shopify/ProductVariant/');

  return (
    <article className="group relative">
      <Link href={href(product)} className="block">
        <div className="relative aspect-[1/1.06] overflow-hidden rounded-[1.65rem] bg-white/[0.06] shadow-[0_20px_54px_rgba(0,0,0,.22)]">
          <img src={image(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061020]/88 via-[#061020]/10 to-transparent" />
          {pct(product) > 0 ? <span className="absolute left-2.5 top-2.5 rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-blue-700">-{pct(product)}%</span> : null}
          <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-[#07111f]/64 px-2.5 py-1 text-[10px] font-bold text-blue-50 backdrop-blur-xl"><Star className="h-3 w-3 fill-blue-100 text-blue-100" /> {product.rating || 5}.0</span>
        </div>
        <div className="px-1.5 pt-3">
          <p className="text-[8px] font-black uppercase tracking-[0.20em] text-blue-100/52">{category(product)}</p>
          <h3 className="mt-1.5 line-clamp-2 min-h-[2.4rem] text-sm font-black leading-tight text-white sm:text-[15px]">{product.name}</h3>
          <p className="mt-2 text-lg font-black tracking-[-0.03em] text-white">{clp(final(product))}</p>
        </div>
      </Link>

      <div className="mt-3 grid grid-cols-[1fr_44px] gap-2 px-1.5">
        <button onClick={onAdd} disabled={needsShopifyVariant && !ok} className="flex h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f8fbff,#93bdff_50%,#2563eb)] text-[10px] font-black uppercase tracking-[0.14em] text-[#061326] shadow-[0_14px_32px_rgba(37,99,235,.28)] transition hover:-translate-y-0.5 disabled:opacity-45">
          <ShoppingBag className="h-3.5 w-3.5" /> Añadir
        </button>
        <Link href={href(product)} aria-label={`Comprar ${product.name}`} className="grid h-11 place-items-center rounded-full bg-white/[0.075] text-white/82 backdrop-blur-xl transition hover:bg-white/[0.13]">
          <CreditCard className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
