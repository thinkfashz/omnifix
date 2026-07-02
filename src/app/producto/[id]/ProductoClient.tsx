'use client';

/* eslint-disable @next/next/no-img-element */

import Link from 'next/link';
import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, CreditCard, ShoppingBag, Star, Truck } from 'lucide-react';
import { useCatalogProducts } from '@/hooks/useCatalogProducts';
import { CART_SESSION_KEY, useCartContext } from '@/context/CartContext';
import { OMNIFIX_EXTRA_PRODUCTS } from '@/lib/omnifixExtraProducts';

type Product = { id: string; name: string; price: number; description?: string; image_url?: string; img?: string; category?: string; category_id?: string; category_name?: string; discount_percentage?: number; discountPercentage?: number; stock?: number; shopifyVariantId?: string; shopifyProductId?: string; shopifyHandle?: string; rating?: number; tagline?: string; features?: string[]; delivery?: string; dimensions?: string };

function category(product: Product) { return product.category_name || product.category || product.category_id || 'Tecnología'; }
function image(product: Product) { return product.image_url || product.img || '/omnifix-logo.svg'; }
function discount(product: Product) { return product.discount_percentage ?? product.discountPercentage ?? 0; }
function finalPrice(product: Product) { const pct = discount(product); return pct > 0 ? Math.round(product.price * (1 - pct / 100)) : product.price; }
function money(value: number) { return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0); }
function toCart(product: Product) { return { id: product.id, name: product.name, price: product.price, image_url: image(product), category_id: category(product), discount_percentage: discount(product), stock: product.stock, description: product.description, shopifyVariantId: product.shopifyVariantId, shopifyProductId: product.shopifyProductId, shopifyHandle: product.shopifyHandle } as never; }
function href(product: Product) { return `/producto/${encodeURIComponent(product.id)}`; }

function NotFound() {
  return <main className="min-h-screen bg-[#020617] px-4 py-10 text-white"><div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 text-center"><h1 className="text-3xl font-black">Producto no encontrado</h1><p className="mt-3 text-slate-400">Vuelve al catálogo y selecciona otro producto.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-blue-500 px-6 py-3 text-sm font-black uppercase tracking-[.16em] text-white">Volver al catálogo</Link></div></main>;
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
  const related = allProducts.filter((item) => item.id !== currentId && (!product || category(item) === category(product))).slice(0, 6);

  if (!product) return <NotFound />;

  function buyNow() {
    if (!product) return;
    const cartProduct = toCart(product);
    try { sessionStorage.setItem(CART_SESSION_KEY, JSON.stringify([{ product: cartProduct, quantity: 1 }])); } catch {}
    router.push('/checkout?cart=1');
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <section className="relative overflow-hidden px-4 py-5 md:px-8 md:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.28),transparent_35rem),radial-gradient(circle_at_90%_80%,rgba(34,211,238,.14),transparent_28rem)]" />
        <div className="relative mx-auto max-w-6xl">
          <button onClick={() => router.back()} className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-black uppercase tracking-[.16em] text-blue-100"><ArrowLeft className="h-4 w-4" /> Volver</button>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-[0_28px_100px_rgba(0,0,0,.38)]"><img src={image(product)} alt={product.name} className="h-[360px] w-full object-cover sm:h-[460px]" /></div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 backdrop-blur-2xl sm:p-7">
              <p className="inline-flex rounded-full bg-blue-400/15 px-3 py-1 text-[10px] font-black uppercase tracking-[.22em] text-blue-200">{category(product)}</p>
              <h1 className="mt-4 text-4xl font-black leading-[.95] tracking-[-.06em] sm:text-6xl">{product.name}</h1>
              <p className="mt-4 text-base leading-7 text-slate-300">{product.description || product.tagline || 'Producto seleccionado por Omnifix.'}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3"><span className="text-4xl font-black text-blue-200">{money(finalPrice(product))}</span>{discount(product) > 0 && <span className="rounded-full bg-blue-500 px-3 py-1 text-xs font-black text-white">-{discount(product)}%</span>}<span className="inline-flex items-center gap-1 text-sm text-slate-400"><Star className="h-4 w-4 fill-blue-300 text-blue-300" /> {product.rating || 5}.0</span></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2"><Info icon={<Truck className="h-4 w-4" />} title="Entrega" text={product.delivery || 'Entrega a coordinar'} /><Info icon={<CheckCircle2 className="h-4 w-4" />} title="Stock" text={product.stock != null ? `${product.stock} disponibles` : 'Sujeto a confirmación'} /></div>
              <div className="mt-6 space-y-3">{(product.features || ['Producto verificado', 'Soporte Omnifix', 'Compra protegida']).slice(0, 4).map((feature) => <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-slate-200"><CheckCircle2 className="h-4 w-4 shrink-0 text-blue-300" /> {feature}</div>)}</div>
              <div className="mt-7 grid gap-3 sm:grid-cols-2"><button onClick={() => addToCart(toCart(product))} className="flex h-14 items-center justify-center gap-2 rounded-full border border-blue-300/25 bg-white/[0.06] text-sm font-black uppercase tracking-[.16em] text-blue-100"><ShoppingBag className="h-5 w-5" /> Agregar</button><button onClick={buyNow} className="flex h-14 items-center justify-center gap-2 rounded-full bg-blue-500 text-sm font-black uppercase tracking-[.16em] text-white shadow-[0_18px_44px_rgba(37,99,235,.35)]"><CreditCard className="h-5 w-5" /> Checkout</button></div>
              <p className="mt-4 text-xs leading-5 text-slate-500">El checkout confirma disponibilidad, impuestos, despacho y total final.</p>
            </div>
          </div>
          {related.length > 0 && <div className="mt-8"><h2 className="text-xl font-black">Productos relacionados</h2><div className="mt-4 grid auto-cols-[150px] grid-flow-col gap-3 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-[180px]">{related.map((item) => <Link key={item.id} href={href(item)} className="overflow-hidden rounded-[1.25rem] bg-white text-slate-950"><img src={image(item)} alt={item.name} className="h-28 w-full object-cover" /><div className="p-3"><p className="line-clamp-2 text-sm font-black leading-tight">{item.name}</p><p className="mt-2 text-sm font-black text-blue-700">{money(finalPrice(item))}</p></div></Link>)}</div></div>}
        </div>
      </section>
    </main>
  );
}

function Info({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><div className="flex items-center gap-2 text-blue-200">{icon}<b className="text-xs uppercase tracking-[.16em]">{title}</b></div><p className="mt-2 text-sm text-slate-300">{text}</p></div>;
}
