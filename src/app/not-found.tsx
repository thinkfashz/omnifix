'use client';

import Link from 'next/link';
import Omnifix3DTextLogo from '@/components/Omnifix3DTextLogo';
import { useSiteContent } from '@/hooks/useSiteContent';

export default function NotFound() {
  const content = useSiteContent('error-404');
  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
      <div className="max-w-xl text-center space-y-6">
        <div className="flex justify-center"><Omnifix3DTextLogo text="Omnifix" showTagline /></div>
        <p className="text-blue-300 text-xs tracking-[0.35em] uppercase">404</p>
        {content.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={content.imageUrl} alt="" className="mx-auto max-h-48 w-auto rounded-2xl border border-white/10" />
        ) : null}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">{content.title}</h1>
        <p className="text-white/65 text-sm md:text-base">{content.subtitle}</p>
        <Link href={content.ctaHref || '/'} className="inline-flex items-center justify-center rounded-full border border-blue-400/50 bg-blue-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-blue-700">
          {content.ctaLabel}
        </Link>
      </div>
    </main>
  );
}
