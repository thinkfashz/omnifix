'use client';

import Omnifix3DTextLogo from '@/components/Omnifix3DTextLogo';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  withBricks?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-8 w-8 rounded-xl',
  md: 'h-10 w-10 rounded-xl',
  lg: 'h-12 w-12 rounded-2xl',
  xl: 'h-16 w-16 rounded-2xl',
};

export function BrandMark({ size = 'md', animated = true, className = '' }: BrandMarkProps) {
  return (
    <span className={`relative flex flex-shrink-0 items-center justify-center overflow-hidden border border-blue-300/45 bg-white shadow-[0_8px_24px_rgba(37,99,235,0.28)] ${sizeMap[size]} ${className}`}>
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.7),rgba(37,99,235,0.06)_58%)]" />
      {animated && <span className="absolute inset-y-0 -left-full w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent [animation:brand-sweep_3.8s_ease-in-out_infinite]" />}
      <span className="relative z-10 scale-[0.74]"><Omnifix3DTextLogo compact showText={false} /></span>
      <style jsx>{`
        @keyframes brand-sweep { 0% { transform: translateX(0%); } 55% { transform: translateX(420%); } 100% { transform: translateX(420%); } }
      `}</style>
    </span>
  );
}

export function BrandWordmark({ tagline, className = '' }: { tagline?: string; className?: string }) {
  return (
    <span className={`flex min-w-0 flex-col leading-none ${className}`}>
      <span className="text-[12px] font-black uppercase tracking-[0.26em] text-blue-300">OMNIFIX</span>
      {tagline ? (
        <span className="mt-1 flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)] animate-pulse" />
          <span className="text-[9px] uppercase tracking-[0.32em] text-white/55">{tagline}</span>
        </span>
      ) : null}
    </span>
  );
}
