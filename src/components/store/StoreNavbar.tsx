'use client';

import Link from 'next/link';

export default function StoreNavbar() {
  return (
    <header className="relative z-30 px-5 pt-4">
      <div className="mx-auto flex h-[96px] max-w-3xl items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.10] shadow-[0_18px_70px_rgba(12,5,22,.28)] backdrop-blur-2xl">
        <Link href="/" aria-label="Ir al inicio Omnifix" className="flex items-center justify-center">
          <img src="/omnifix-logo.svg" alt="Omnifix" className="h-[72px] w-auto object-contain drop-shadow-[0_12px_28px_rgba(255,255,255,.16)]" />
        </Link>
      </div>
    </header>
  );
}
