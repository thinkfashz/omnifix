'use client';

import type { CSSProperties } from 'react';

interface Omnifix3DTextLogoProps {
  className?: string;
  height?: number | string;
  text?: string;
  compact?: boolean;
  showText?: boolean;
  showTagline?: boolean;
  interactive?: boolean;
  showHint?: boolean;
  transparent?: boolean;
  cameraZ?: number;
  onLogoClick?: () => void;
}

function toCssHeight(height?: number | string): CSSProperties | undefined {
  if (height === undefined) return undefined;
  return { height: typeof height === 'number' ? `${height}px` : height };
}

export default function Omnifix3DTextLogo({
  className = '',
  height,
  text = 'Omnifix',
  compact = false,
  showText = true,
  showTagline = false,
  interactive = false,
  onLogoClick,
}: Omnifix3DTextLogoProps) {
  const rootClasses = [
    'omnifix-3d-logo group inline-flex select-none items-center justify-center gap-2.5',
    'text-white',
    interactive || onLogoClick ? 'cursor-pointer transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.98]' : '',
    className,
  ].filter(Boolean).join(' ');

  const logoMarkSize = compact ? 'h-9 w-9' : 'h-12 w-12 sm:h-14 sm:w-14';
  const wordSize = compact ? 'text-[1.15rem]' : 'text-[1.75rem] sm:text-[2.2rem]';

  return (
    <div
      role={onLogoClick ? 'button' : 'img'}
      tabIndex={onLogoClick ? 0 : undefined}
      aria-label="Omnifix"
      onClick={onLogoClick}
      onKeyDown={(event) => {
        if (!onLogoClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onLogoClick();
        }
      }}
      className={rootClasses}
      style={toCssHeight(height)}
    >
      <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/95 shadow-[0_18px_45px_rgba(15,23,42,.22)] ring-1 ring-blue-200/70 ${logoMarkSize}`}>
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,197,253,.45),transparent_42%),linear-gradient(135deg,#fff,#dbeafe)]" />
        <svg viewBox="0 0 120 120" className="relative h-[82%] w-[82%] drop-shadow-[0_12px_12px_rgba(37,99,235,.25)]" aria-hidden="true">
          <defs>
            <linearGradient id="omnifixMarkBlue" x1="15" y1="15" x2="105" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#020617" />
              <stop offset="0.48" stopColor="#2563eb" />
              <stop offset="1" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="omnifixMarkHighlight" x1="38" y1="18" x2="88" y2="105" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="1" stopColor="#93c5fd" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d="M18 94 60 18l42 76H79L60 58 41 94H18Z" fill="url(#omnifixMarkBlue)" />
          <path d="M60 18 102 94H82L60 54V18Z" fill="#0b3bff" opacity="0.72" />
          <path d="M42 94 60 58l18 36H42Z" fill="#38bdf8" opacity="0.82" />
          <path d="M58 22c6 25 16 48 33 68" stroke="url(#omnifixMarkHighlight)" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      </span>

      {showText ? (
        <span className="flex flex-col leading-none">
          <span
            className={`font-black uppercase tracking-[0.15em] ${wordSize}`}
            style={{
              fontFamily: 'Oswald, Impact, Arial Black, system-ui, sans-serif',
              color: '#eef6ff',
              textShadow: '1px 1px 0 #60a5fa, 2px 2px 0 #2563eb, 3px 3px 0 #1d4ed8, 8px 12px 24px rgba(15,23,42,.42)',
              WebkitTextStroke: '0.4px rgba(255,255,255,.35)',
            }}
          >
            {text}
          </span>
          {showTagline ? (
            <span className="mt-1 text-[9px] font-black uppercase tracking-[0.34em] text-sky-200/80 sm:text-[10px]">
              Todo tiene solución
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  );
}
