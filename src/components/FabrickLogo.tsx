'use client';

import { type KeyboardEvent } from 'react';
import Omnifix3DTextLogo from './Omnifix3DTextLogo';

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

  const rootClass = [
    'group inline-flex select-none items-center gap-2 sm:gap-2.5',
    'transition-transform duration-300',
    isInteractive ? 'cursor-pointer hover:-translate-y-0.5' : '',
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <Omnifix3DTextLogo
      compact={compact}
      showText={!compact}
      showTagline={!compact}
      text="Omnifix"
      interactive={false}
      className={compact ? 'scale-[.92]' : ''}
    />
  );

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
