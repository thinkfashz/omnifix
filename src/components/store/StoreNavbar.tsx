'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import FabrickLogo from '@/components/FabrickLogo';

interface StoreNavbarProps {
  cartCount?: number;
  onCartToggle?: () => void;
}

export default function StoreNavbar({ cartCount = 0, onCartToggle }: StoreNavbarProps) {
  return (
    <header className="relative z-30 px-4 pt-4 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[0.10] px-3 py-2 shadow-[0_18px_60px_rgba(0,0,0,.22)] backdrop-blur-2xl md:px-5">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <FabrickLogo compact className="pointer-events-none" />
          <span className="hidden min-w-0 flex-col sm:flex">
            <span className="text-[13px] font-black uppercase tracking-[0.28em] text-white">OMNIFIX</span>
            <span className="mt-0.5 text-[10px] font-semibold text-blue-100/70">Tienda tecnológica</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/auth" className="hidden rounded-full border border-white/10 bg-white/[0.07] px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/72 transition hover:bg-white/12 hover:text-white sm:inline-flex">Cuenta</Link>
          <button onClick={onCartToggle} className="relative grid h-11 w-11 place-items-center rounded-full bg-[linear-gradient(135deg,#eaf2ff,#8db9ff_48%,#2563eb)] text-[#061326] shadow-[0_12px_30px_rgba(37,99,235,.35)] transition hover:-translate-y-0.5" aria-label="Abrir carrito">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[10px] font-black text-blue-700">{cartCount}</span> : null}
          </button>
        </div>
      </div>
    </header>
  );
}
