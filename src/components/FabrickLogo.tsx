'use client';

import Image from 'next/image';
import { type KeyboardEvent } from 'react';

interface Props {
  onClick?: () => void;
  animate?: boolean;
  className?: string;
  compact?: boolean;
}

export default function FabrickLogo({ onClick, className = '', compact = false }: Props) {
  const isInteractive = typeof onClick === 'function';

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onClick(); }
  };

  const content = (
    <>
      <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-blue-400/25 bg-white shadow-[0_0_24px_rgba(37,99,235,.18)]">
        <Image src="/omnifix-logo.svg" alt="Omnifix" fill sizes="48px" className="object-cover" priority />
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-white sm:text-sm">
            Omnifix
          </span>
          <span className="text-[9px] font-light uppercase tracking-[0.24em] text-blue-300/80 sm:text-[10px]">
            Todo tiene solución
          </span>
        </span>
      )}
    </>
  );

  const rootClass = [
    'group inline-flex select-none items-center gap-2 sm:gap-2.5',
    'transition-transform duration-300',
    isInteractive ? 'cursor-pointer hover:-translate-y-0.5' : '',
    className,
  ].filter(Boolean).join(' ');

  if (isInteractive) {
    return (
      <div onClick={onClick} onKeyDown={handleKey} role="button" tabIndex={0} aria-label="Omnifix — inicio" className={rootClass}>
        {content}
      </div>
    );
  }

  return (
    <div role="img" aria-label="Omnifix — inicio" className={rootClass}>
      {content}
    </div>
  );
}
