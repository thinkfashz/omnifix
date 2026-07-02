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

type Product = { id: string; name: string; price: number; description?: string; image_url?: string; img?: string; category?: string; category_id?: string; category_name?: string; stock?: number | string; discount_percentage?: number; discountPercentage?: number; shopifyVariantId?: string; shopifyProductId?: string; shopifyHandle?: string; source?: string; rating?: number; tagline?: string };

function clp(n: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n || 0); }
function image(p: Product) { return p.image_url || p.img || '/omnifix-logo.svg'; }
function category(p: Product) { return p.category_name || p.category || p.category_id || 'Tecnología'; }
function pct(p: Product) { return p.discount_percentage ?? p.discountPercentage ?? 0; }
function final(p: Product) { const d = pct(p); return d > 0 ? Math.round(p.price * (1 - d / 100)) : p.price; }
function href(p: Product) { return `/producto/${encodeURIComponent(p.id)}`; }
function toCart(p: Product) { return { id: p.id, name: p.name, price: p.price, image_url: image(p), category_id: category(p), discount_percentage: pct(p), stock: typeof p.stock === 'number' ? p.stock : undefined, description: p.description, shopifyVariantId: p.shopifyVariantId, shopifyProductId: p.shopifyProductId, shopifyHandle: p.shopifyHandle } as never; }

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,.24),transparent_24rem),radial-gradient(circle_at_78%_18%,rgba(96,165,250,.30),transparent_30rem),radial-gradient(circle_at_52%_82%,rgba(219,234,254,.18),transparent_32rem),linear-gradient(180deg,#07111f_0%,#0b1c33_48%,#061020_100%)]" />
        <div className="absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full bg-[#f9fbff]/10 blur-[100px] omni-float-slow" />
        <div className="absolute right-[-8rem] top-[24%] h-[30rem] w-[30rem] rounded-full bg-blue-400/20 blur-[110px] omni-float-medium" />
        <div className="absolute bottom-[-10rem] left-[18%] h-[26rem] w-[26rem] rounded-full bg-white/10 blur-[120px] omni-float-fast" />
      </div>

      <StoreNavbar cartCount={totalItems} onCartToggle={openCart} />

      <section className="relative z-10 px-4 pb-8 pt-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.085] p-5 shadow-[0_24px_90px_rgba(0,0,0,.30)] backdrop-blur-2xl md:p-8">
            <div className="grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.09] px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-blue-100"><Sparkles className="h-3.5 w-3.5" /> Omnifix Store</p>
                <h1 className="mt-5 max-w-2xl text-[clamp(42px,11vw,92px)] font-black leading-[0.88] tracking-[-0.08em]">Tecnología premium para comprar hoy.</h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-blue-50/72 md:text-base">Explora productos tecnológicos, abre cada ficha, revisa detalles, comentarios y pasa directo al checkout seguro.</p>
                <div className="mt-7 flex flex-wrap gap-3"><a href="#catalogo" className="inline-flex h-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f8fbff,#9dc2ff_50%,#2563eb)] px-7 text-sm font-black uppercase tracking-[0.16em] text-[#061326] shadow-[0_18px_44px_rgba(37,99,235,.30)] transition hover:-translate-y-0.5">Ver catálogo</a><button onClick={openCart} className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.08] px-7 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/[0.14]"><ShoppingBag className="h-4 w-4" /> Carrito</button></div>
              </div>

              <div className="relative min-h-[320px] md:min-h-[460px]">
                <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.32),transparent_18rem),linear-gradient(135deg,rgba(255,255,255,.18),rgba(37,99,235,.12))] blur-xl" />
                <div className="relative h-full min-h-[320px] overflow-hidden rounded-[2.8rem] bg-[linear-gradient(135deg,rgba(255,255,255,.24),rgba(255,255,255,.06))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_28px_90px_rgba(0,0,0,.24)]">
                  <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1400&auto=format&fit=crop" alt="Computador premium Omnifix" className="h-full min-h-[320px] w-full rounded-[2.2rem] object-cover opacity-95 mix-blend-screen" />
                  <div className="absolute inset-0 rounded-[2.8rem] bg-[linear-gradient(90deg,rgba(7,17,31,.15),transparent_45%,rgba(255,255,255,.16))]" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-24"><div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent via-white/[0.045] to-transparent blur-2xl" /></div>

          <section id="catalogo" className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.075] p-4 shadow-[0_24px_90px_rgba(0,0,0,.22)] backdrop-blur-2xl md:p-6">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(255,255,255,.08),transparent_20rem),radial-gradient(circle_at_90%_15%,rgba(59,130,246,.12),transparent_22rem)]" />
            <div className="relative mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div><p className="text-[10px] font-black uppercase tracking-[0.30em] text-blue-100/75">Catálogo Omnifix</p><h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white md:text-5xl">Productos</h2></div>
              <label className="relative block w-full md:max-w-md"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-100/75" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto..." className="h-14 w-full rounded-full border border-white/10 bg-white/[0.08] pl-12 pr-4 text-sm font-bold text-white outline-none placeholder:text-white/35 focus:border-blue-200/45 focus:bg-white/[0.12]" /></label>
            </div>

            <div className="relative mb-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{categories.map((item) => <button key={item} onClick={() => setSelectedCategory(item)} className={`shrink-0 rounded-full px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] transition ${selectedCategory === item ? 'bg-white text-blue-700 shadow-[0_12px_30px_rgba(255,255,255,.12)]' : 'border border-white/10 bg-white/[0.07] text-white/58 hover:text-white'}`}>{item}</button>)}</div>

            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">{filtered.map((p) => <ProductCard key={p.id} product={p} onAdd={() => addToCart(toCart(p))} />)}</div>
            {filtered.length === 0 && <p className="relative mt-8 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center text-sm font-bold text-white/56">No encontré productos con esa búsqueda.</p>}
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
  return <article className="group overflow-hidden rounded-[1.45rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,.15),rgba(255,255,255,.055))] shadow-[0_14px_45px_rgba(0,0,0,.20)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-blue-200/35"><Link href={href(product)} className="block"><div className="relative aspect-square overflow-hidden bg-white/10"><img src={image(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />{pct(product) > 0 && <span className="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[9px] font-black text-blue-700">-{pct(product)}%</span>}</div><div className="p-3.5"><p className="text-[8px] font-black uppercase tracking-[0.18em] text-blue-100/70">{category(product)}</p><h3 className="mt-1.5 line-clamp-2 min-h-[2.4rem] text-sm font-black leading-tight text-white sm:text-[15px]">{product.name}</h3><div className="mt-3 flex items-center justify-between gap-2"><span className="text-[15px] font-black text-white">{clp(final(product))}</span><span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-100/65"><Star className="h-3 w-3 fill-blue-100 text-blue-100" /> {product.rating || 5}.0</span></div></div></Link><div className="grid gap-2 px-3.5 pb-3.5"><button onClick={onAdd} disabled={needsShopifyVariant && !ok} className="flex h-10 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f8fbff,#8db9ff_50%,#2563eb)] text-[10px] font-black uppercase tracking-[0.13em] text-[#061326] shadow-[0_14px_32px_rgba(37,99,235,.28)] transition hover:-translate-y-0.5 disabled:opacity-45"><ShoppingBag className="h-3.5 w-3.5" /> Añadir</button><Link href={href(product)} className="flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.07] text-[10px] font-black uppercase tracking-[0.13em] text-white/82 transition hover:bg-white/[0.13]"><CreditCard className="h-3.5 w-3.5" /> Comprar</Link></div></article>;
}
