'use client';

import Link from 'next/link';
import Omnifix3DSvgLogo from '@/components/store/Omnifix3DSvgLogo';

export default function StoreNavbar() {
  return (
    <header className="relative z-30 bg-white px-5 pt-4">
      <div className="mx-auto flex h-[104px] max-w-3xl items-center justify-center border-b border-slate-100">
        <Link href="/" aria-label="Ir al inicio Omnifix" className="flex items-center justify-center">
          <Omnifix3DSvgLogo className="h-[82px] w-[300px] max-w-[76vw]" />
        </Link>
      </div>
    </header>
  );
}
