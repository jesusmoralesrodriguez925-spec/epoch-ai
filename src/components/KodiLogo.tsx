import React from 'react';

interface KodiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const KodiLogo: React.FC<KodiLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  // Hexagon dimensions
  const dimensions = {
    sm: { width: 44, height: 50, fontSize: 'text-lg', kSize: 'text-2xl', textTracking: 'tracking-[0.25em]' },
    md: { width: 78, height: 90, fontSize: 'text-2xl', kSize: 'text-4xl', textTracking: 'tracking-[0.3em]' },
    lg: { width: 110, height: 126, fontSize: 'text-3xl', kSize: 'text-6xl', textTracking: 'tracking-[0.35em]' },
    xl: { width: 140, height: 160, fontSize: 'text-4xl', kSize: 'text-7xl', textTracking: 'tracking-[0.4em]' },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Hexagon with Silver Border & White 'K' inside */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: dimensions.width, height: dimensions.height }}
      >
        <svg
          viewBox="0 0 100 115"
          className="w-full h-full drop-shadow-[0_2px_12px_rgba(255,255,255,0.05)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle outer metallic glow/line */}
          <polygon
            points="50,2 96,28 96,87 50,113 4,87 4,28"
            stroke="#52525b"
            strokeWidth="0.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#050507"
          />
          {/* Main Fine Silver Hexagon Border */}
          <polygon
            points="50,4 94,29 94,86 50,111 6,86 6,29"
            stroke="url(#silverGradient)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner subtle rim */}
          <polygon
            points="50,7 91,30.5 91,84.5 50,108 9,84.5 9,30.5"
            stroke="#27272a"
            strokeWidth="0.5"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f4f4f5" />
              <stop offset="30%" stopColor="#a1a1aa" />
              <stop offset="70%" stopColor="#e4e4e7" />
              <stop offset="100%" stopColor="#71717a" />
            </linearGradient>
          </defs>

          {/* Clean pure white capital 'K' inside */}
          <text
            x="50%"
            y="54%"
            dominantBaseline="central"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="'Cinzel', 'Times New Roman', serif"
            fontSize="48"
            fontWeight="700"
            className="tracking-normal"
          >
            K
          </text>
        </svg>
      </div>

      {/* Elegant minimalist text "KODI" */}
      {showText && (
        <div className="mt-5 text-center">
          <span
            className={`block font-light text-white ${dimensions.fontSize} ${dimensions.textTracking} font-sans uppercase`}
            style={{ letterSpacing: '0.35em', textIndent: '0.35em' }}
          >
            KODI
          </span>
        </div>
      )}
    </div>
  );
};
