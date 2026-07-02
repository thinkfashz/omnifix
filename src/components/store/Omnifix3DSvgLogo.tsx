export default function Omnifix3DSvgLogo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 620 150" role="img" aria-label="Omnifix" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="omnifix3dFace" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="48%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="omnifix3dSide" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#172554" />
          <stop offset="55%" stopColor="#312e81" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <filter id="omnifixClayShadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="12" stdDeviation="11" floodColor="#0f172a" floodOpacity="0.24" />
          <feDropShadow dx="-8" dy="10" stdDeviation="7" floodColor="#2563eb" floodOpacity="0.16" />
        </filter>
        <filter id="omnifixSoftBevel" x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur" />
          <feSpecularLighting in="blur" surfaceScale="4" specularConstant="0.85" specularExponent="18" lightingColor="#ffffff" result="spec">
            <fePointLight x="-70" y="-90" z="150" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut" />
          <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="0.55" k4="0" />
        </filter>
      </defs>

      <g filter="url(#omnifixClayShadow)">
        <text x="50%" y="95" textAnchor="middle" fontFamily="Oswald, Arial Black, Impact, sans-serif" fontSize="78" fontWeight="900" letterSpacing="6" fill="url(#omnifix3dSide)" transform="translate(9 11)">
          OMNIFIX
        </text>
        <text x="50%" y="95" textAnchor="middle" fontFamily="Oswald, Arial Black, Impact, sans-serif" fontSize="78" fontWeight="900" letterSpacing="6" fill="url(#omnifix3dSide)" transform="translate(5 6)">
          OMNIFIX
        </text>
        <text x="50%" y="95" textAnchor="middle" fontFamily="Oswald, Arial Black, Impact, sans-serif" fontSize="78" fontWeight="900" letterSpacing="6" fill="url(#omnifix3dFace)" filter="url(#omnifixSoftBevel)">
          OMNIFIX
        </text>
        <text x="50%" y="124" textAnchor="middle" fontFamily="Inter, Arial, sans-serif" fontSize="15" fontWeight="800" letterSpacing="12" fill="#0f172a" opacity="0.72">
          TODO TIENE SOLUCIÓN
        </text>
      </g>
    </svg>
  );
}
