'use client';

/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from 'react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { CART_SESSION_KEY, useCartContext } from '@/context/CartContext';
import { OMNIFIX_EXTRA_PRODUCTS } from '@/lib/omnifixExtraProducts';
import StoreFooter from '@/components/store/StoreFooter';
import ProductComments from '@/components/store/ProductComments';

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
  rating?: number;
  tagline?: string;
  features?: string[];
  delivery?: string;
};

function category(product: Product) { return product.category_name || product.category || product.category_id || 'Tecnología'; }
function image(product: Product) { return product.image_url || product.img || '/omnifix-logo.svg'; }
function discount(product: Product) { return product.discount_percentage ?? product.discountPercentage ?? 0; }
function finalPrice(product: Product) { const pct = discount(product); return pct > 0 ? Math.round(product.price * (1 - pct / 100)) : product.price; }
function money(value: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0); }
function toCart(product: Product) { return { id: product.id, name: product.name, price: product.price, image_url: image(product), category_id: category(product), discount_percentage: discount(product), stock: product.stock, description: product.description, shopifyVariantId: product.shopifyVariantId, shopifyProductId: product.shopifyProductId, shopifyHandle: product.shopifyHandle } as never; }
function href(product: Product) { return `/producto/${encodeURIComponent(product.id)}`; }

function NotFound() {
  return (
    <main className="min-h-screen bg-[#07111f] px-4 py-10 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center backdrop-blur-2xl">
        <h1 className="text-3xl font-black">Producto no encontrado</h1>
        <p className="mt-3 text-white/56">Vuelve al catálogo y selecciona otro producto.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-blue-500 px-6 py-3 text-sm font-black uppercase tracking-[.16em] text-white">Volver al catálogo</Link>
      </div>
    </main>
  );
}

export default function ProductoClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { products } = useCatalogProducts();
  const { addToCart } = useCartContext();

  const allProducts = useMemo<Product[]>(() => {
    const map = new Map<string, Product>();
    [...(products as Product[]), ...(OMNIFIX_EXTRA_PRODUCTS as Product[])].forEach((product) => map.set(product.id, product));
    return Array.from(map.values());
  }, [products]);

  const currentId = decodeURIComponent(params?.id || '');
  const product = allProducts.find((item) => item.id === currentId);
  const related = allProducts.filter((item) => item.id !== currentId && (!product || category(item) === category(product))).slice(0, 8);

  if (!product) return <NotFound />;

  function buyNow() {
    if (!product) return;
    const cartProduct = toCart(product);
    try {
      sessionStorage.setItem(CART_SESSION_KEY, JSON.stringify([{ product: cartProduct, quantity: 1 }]));
    } catch {}
    router.push('/checkout?cart=1');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(255,255,255,.22),transparent_24rem),radial-gradient(circle_at_82%_18%,rgba(96,165,250,.28),transparent_30rem),radial-gradient(circle_at_58%_86%,rgba(219,234,254,.16),transparent_32rem),linear-gradient(180deg,#07111f_0%,#0b1c33_48%,#061020_100%)]" />
        <div className="absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-[100px] omni-float-slow" />
        <div className="absolute right-[-8rem] top-[24%] h-[30rem] w-[30rem] rounded-full bg-blue-400/20 blur-[110px] omni-float-medium" />
      </div>

      <section className="relative z-10 px-4 py-5 md:px-8 md:py-8">
        <div className="mx-auto max-w-7xl">
          <button onClick={() => router.back()} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-3 text-xs font-black uppercase tracking-[.16em] text-blue-100 backdrop-blur-xl">
            <ArrowLeft className="h-4 w-4" /> Volver
          </button>

          <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
            <div className="overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/[0.08] p-3 shadow-[0_28px_100px_rgba(0,0,0,.34)] backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[2rem]">
                <img src={image(product)} alt={product.name} className="h-[360px] w-full object-cover sm:h-[520px]" />
              </div>
            </div>

            <div className="rounded-[2.4rem] border border-white/10 bg-white/[0.085] p-5 shadow-[0_24px_90px_rgba(0,0,0,.26)] backdrop-blur-2xl sm:p-7">
              <p className="inline-flex rounded-full border border-blue-200/20 bg-blue-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[.22em] text-blue-100">{category(product)}</p>
              <h1 className="mt-4 text-4xl font-black leading-[.95] tracking-[-.06em] sm:text-6xl">{product.name}</h1>
              <p className="mt-4 text-base leading-7 text-white/64">{product.description || product.tagline || 'Producto tecnológico premium seleccionado por Omnifix.'}</p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-4xl font-black text-white">{money(finalPrice(product))}</span>
                {discount(product) > 0 ? <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700">-{discount(product)}%</span> : null}
                <span className="inline-flex items-center gap-1 text-sm text-blue-100/75"><Star className="h-4 w-4 fill-blue-100 text-blue-100" /> {product.rating || 5}.0</span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Info icon={<Truck className="h-4 w-4" />} title="Entrega" text={product.delivery || 'Entrega a coordinar'} />
                <Info icon={<CheckCircle2 className="h-4 w-4" />} title="Stock" text={product.stock != null ? `${product.stock} disponibles` : 'Sujeto a confirmación'} />
              </div>

              <div className="mt-6 space-y-3">
                {(product.features || ['Producto verificado', 'Soporte Omnifix', 'Compra protegida', 'Ficha clara']).slice(0, 4).map((feature) => (
                  <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/72"><CheckCircle2 className="h-4 w-4 shrink-0 text-blue-100" /> {feature}</div>
                ))}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button onClick={() => addToCart(toCart(product))} className="flex h-14 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.09] text-sm font-black uppercase tracking-[.16em] text-white transition hover:bg-white/[0.15]"><ShoppingBag className="h-5 w-5" /> Añadir</button>
                <button onClick={buyNow} className="flex h-14 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f8fbff,#8db9ff_50%,#2563eb)] text-sm font-black uppercase tracking-[.16em] text-[#061326] shadow-[0_18px_44px_rgba(37,99,235,.35)] transition hover:-translate-y-0.5"><CreditCard className="h-5 w-5" /> Comprar ahora</button>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-white/42"><ShieldCheck className="h-3.5 w-3.5 text-blue-100" /> El checkout confirma disponibilidad, despacho y total final.</p>
            </div>
          </div>

          {related.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-xl font-black">Productos relacionados</h2>
              <div className="mt-4 grid auto-cols-[150px] grid-flow-col gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-[180px]">
                {related.map((item) => <Link key={item.id} href={href(item)} className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.10] text-white backdrop-blur-xl"><img src={image(item)} alt={item.name} className="h-28 w-full object-cover" /><div className="p-3"><p className="line-clamp-2 text-sm font-black leading-tight">{item.name}</p><p className="mt-2 text-sm font-black text-blue-100">{money(finalPrice(item))}</p></div></Link>)}
              </div>
            </div>
          ) : null}

          <div className="mt-8"><ProductComments productName={product.name} /></div>
        </div>
      </section>
      <StoreFooter />
    </main>
  );
}

function Info({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="flex items-center gap-2 text-blue-100">{icon}<b className="text-xs uppercase tracking-[.16em]">{title}</b></div><p className="mt-2 text-sm text-white/62">{text}</p></div>;
}
