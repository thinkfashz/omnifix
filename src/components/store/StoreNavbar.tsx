'use client';

import Link from 'next/link';
import Omnifix3DSvgLogo from '@/components/store/Omnifix3DSvgLogo';

export default function StoreNavbar() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-5 pt-3 md:pt-5">
      <div className="mx-auto flex max-w-5xl items-center justify-center">
        <Link href="/" aria-label="Ir al inicio Omnifix" className="pointer-events-auto flex items-center justify-center rounded-full bg-white/70 px-5 py-2 shadow-[0_18px_60px_rgba(15,23,42,.10)] backdrop-blur-2xl transition active:scale-95">
          <Omnifix3DSvgLogo className="h-[58px] w-[220px] max-w-[64vw]" />
        </Link>
      </div>
    </header>
  );
}
