/**
 * Omnifix brand icon and wordmark.
 * Monochrome + deep electric blue identity for the Omnifix ecommerce system.
 */

interface IconProps {
  size?: number;
  className?: string;
}

interface FullLogoProps {
  theme?: 'light' | 'dark';
  className?: string;
  tagline?: string;
}

export function FabrickPeakIcon({ size = 32, className = '' }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Omnifix"
      className={className}
    >
      <defs>
        <linearGradient id="omnifix-blue" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="48%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0f1bff" />
        </linearGradient>
      </defs>
      <rect x="5" y="5" width="38" height="38" rx="13" fill="#05070d" stroke="url(#omnifix-blue)" strokeWidth="2.2" />
      <path d="M15 24c0-6.15 3.85-10.4 9-10.4s9 4.25 9 10.4-3.85 10.4-9 10.4-9-4.25-9-10.4Z" stroke="url(#omnifix-blue)" strokeWidth="3.4" />
      <path d="M24 14v20M16.5 24h15" stroke="#f8fafc" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function FabrickFullLogo({ theme = 'light', tagline, className = '' }: FullLogoProps) {
  const textPrimary = theme === 'light' ? '#ffffff' : '#05070d';
  const textMuted = theme === 'light' ? 'rgba(255,255,255,0.52)' : 'rgba(5,7,13,0.52)';
  return (
    <div className={`inline-flex select-none items-center gap-2.5 ${className}`}>
      <FabrickPeakIcon size={38} />
      <div className="flex flex-col leading-tight">
        <span className="text-[9px] font-semibold uppercase tracking-[0.32em]" style={{ color: textMuted }}>
          TODO TIENE
        </span>
        <span className="text-[21px] font-black uppercase leading-none tracking-[0.08em]" style={{ color: textPrimary, fontFamily: 'Montserrat, Poppins, sans-serif' }}>
          OMNIFIX
        </span>
        {tagline && <span className="mt-0.5 text-[9px] uppercase tracking-[0.28em]" style={{ color: textMuted }}>{tagline}</span>}
      </div>
    </div>
  );
}

export function FabrickNavLogo({ theme = 'light', className = '' }: Omit<FullLogoProps, 'tagline'>) {
  const textPrimary = theme === 'light' ? '#ffffff' : '#05070d';
  const textMuted = theme === 'light' ? 'rgba(255,255,255,0.54)' : 'rgba(5,7,13,0.54)';
  return (
    <div className={`inline-flex select-none items-center gap-2 ${className}`}>
      <FabrickPeakIcon size={30} />
      <span className="flex flex-col leading-none">
        <span className="text-[13px] font-black uppercase tracking-widest" style={{ color: textPrimary }}>Omnifix</span>
        <span className="text-[9px] uppercase tracking-widest" style={{ color: textMuted }}>Todo tiene solución</span>
      </span>
    </div>
  );
}
