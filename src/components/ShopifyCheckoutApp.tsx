'use client';

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Loader2, Lock, ShieldCheck, ShoppingBag } from 'lucide-react';
import { CART_SESSION_KEY } from '@/context/CartContext';

type StoredCartItem = {
  product: {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    discount_percentage?: number;
    shopifyVariantId?: string;
  };
  quantity: number;
};

type CheckoutResponse = {
  payment?: { checkoutUrl?: string | null } | null;
  error?: string;
};

function formatCLP(value: number) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value || 0);
}

export default function ShopifyCheckoutApp() {
  const [items, setItems] = useState<StoredCartItem[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(CART_SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) as StoredCartItem[] : [];
      setItems(Array.isArray(parsed) ? parsed : []);
    } catch {
      setItems([]);
    }
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => {
      const discount = item.product.discount_percentage || 0;
      return sum + item.product.price * (1 - discount / 100) * item.quantity;
    }, 0),
    [items],
  );

  const hasShopifyVariants = items.length > 0 && items.every((item) => item.product.shopifyVariantId?.startsWith('gid://shopify/ProductVariant/'));
  const formValid = name.trim().length > 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && phone.replace(/\D/g, '').length >= 8 && address.trim().length > 5;

  async function submitShopifyCheckout() {
    if (!hasShopifyVariants) {
      setError('El carrito no tiene variantes válidas de Shopify. Recarga la tienda y agrega los productos nuevamente.');
      return;
    }

    if (!formValid) {
      setError('Completa nombre, correo, teléfono y dirección antes de continuar.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productoId: item.product.id,
            shopifyVariantId: item.product.shopifyVariantId,
            merchandiseId: item.product.shopifyVariantId,
            cantidad: item.quantity,
            nombre: item.product.name,
          })),
          cliente: { nombre: name, email, telefono: phone },
          shippingAddress: address,
          paymentMethod: 'shopify',
        }),
      });
      const payload = await response.json() as CheckoutResponse;
      if (!response.ok || !payload.payment?.checkoutUrl) throw new Error(payload.error || 'Shopify no devolvió checkoutUrl.');
      window.location.href = payload.payment.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el checkout Shopify.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050403] px-4 py-5 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl space-y-5">
        <button onClick={() => window.history.back()} className="inline-flex items-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white/70">
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver
        </button>

        <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#090806] shadow-[0_35px_120px_rgba(0,0,0,.55)] lg:grid-cols-[1fr_390px]">
          <section className="p-5 sm:p-8">
            <span className="inline-flex items-center rounded-full border border-yellow-300/25 bg-yellow-300/10 px-3 py-1 text-xs font-black text-yellow-100">
              <ShieldCheck className="mr-2 h-4 w-4" /> Omnifix + Shopify
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-[-0.07em] sm:text-6xl">Finaliza en Shopify.</h1>
            <p className="mt-4 max-w-2xl text-white/58">
              Omnifix controla la experiencia visual. Shopify manda en productos, variantes, stock, pago y checkout seguro.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <Input label="Nombre completo" value={name} onChange={setName} placeholder="Ej: Eduardo Micolta" />
              <Input label="Correo" value={email} onChange={setEmail} placeholder="cliente@email.com" />
              <Input label="Teléfono" value={phone} onChange={setPhone} placeholder="+56 9..." />
              <Input label="Dirección" value={address} onChange={setAddress} placeholder="Calle, número, comuna" />
            </div>

            {!hasShopifyVariants && (
              <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">
                Este carrito no tiene shopifyVariantId. Recarga el catálogo Shopify y agrega nuevamente los productos.
              </div>
            )}

            {error && <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-100">{error}</div>}

            <button
              onClick={() => void submitShopifyCheckout()}
              disabled={loading || !formValid || !hasShopifyVariants}
              className="mt-6 inline-flex w-full items-center justify-center rounded-[1.4rem] bg-yellow-300 px-5 py-4 text-lg font-black text-black disabled:opacity-45"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
              {loading ? 'Creando carrito Shopify...' : 'Pagar en Shopify'}
            </button>

            <p className="mt-4 text-xs leading-5 text-white/40">
              El backend usa cartCreate, luego cartLinesAdd y finalmente redirige al checkoutUrl de Shopify. Mercado Pago y transferencia quedan fuera del flujo público.
            </p>
          </section>

          <aside className="border-t border-white/10 bg-black/30 p-5 lg:border-l lg:border-t-0 sm:p-8">
            <div className="rounded-[1.6rem] border border-white/10 bg-black/35 p-5">
              <div className="flex items-center gap-2 text-yellow-300"><ShoppingBag className="h-5 w-5" /><b>Resumen Omnifix</b></div>
              <div className="mt-5 space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    {item.product.image_url && <img src={item.product.image_url} alt={item.product.name} className="h-16 w-16 rounded-xl object-cover" />}
                    <div className="flex-1 text-sm">
                      <b>{item.product.name}</b>
                      <p className="mt-1 text-white/45">{item.quantity} unidad(es)</p>
                    </div>
                    <b className="text-sm">{formatCLP(item.product.price * item.quantity)}</b>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between text-lg font-black"><span>Subtotal referencial</span><span>{formatCLP(subtotal)}</span></div>
                <p className="mt-3 text-xs leading-5 text-white/42">Shopify confirma impuestos, despacho y total final.</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-black/35 p-3">
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-yellow-300">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full bg-transparent text-lg font-bold outline-none placeholder:text-white/20" />
    </label>
  );
}
