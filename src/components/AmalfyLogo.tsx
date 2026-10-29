import React from 'react';

export interface AmalfyLogoProps {
  variant?: 'full' | 'header' | 'compact' | 'icon-only';
  theme?: 'light' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  showSub?: boolean;
  className?: string;
  onClick?: () => void;
}

export const AmalfyEmblem: React.FC<{
  sizePx?: number;
  className?: string;
}> = ({ sizePx = 42, className = '' }) => {
  return (
    <div
      style={{ width: sizePx, height: sizePx }}
      className={`relative shrink-0 select-none transition-transform duration-200 group-hover:scale-105 ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Main squircle gradient - luxurious emerald green to deep forest cyan */}
          <linearGradient id="amalfy-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="45%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          {/* Shimmer overlay highlight */}
          <linearGradient id="amalfy-shimmer" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
          </linearGradient>

          {/* Left Wing (Artisans & Services) - pure crisp ice-emerald to mint white */}
          <linearGradient id="amalfy-left" x1="16" y1="50" x2="32" y2="15" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="50%" stopColor="#E6FFFA" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* Right Wing (Real Estate & Structures) - solid crisp white with subtle teal glow */}
          <linearGradient id="amalfy-right" x1="32" y1="15" x2="48" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#D1FAE5" />
            <stop offset="100%" stopColor="#6EE7B7" />
          </linearGradient>

          {/* Golden Bridge (Market, BTP & Escrow) - vibrant sun gold */}
          <linearGradient id="amalfy-gold" x1="18" y1="37" x2="46" y2="37" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="48%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Radial aura glow */}
          <radialGradient id="amalfy-aura" cx="32" cy="22" r="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0" />
          </radialGradient>

          {/* Soft drop shadow */}
          <filter id="amalfy-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#022C22" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* Squircle base with double luxury border */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="17"
          fill="url(#amalfy-bg)"
        />
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="17"
          fill="url(#amalfy-shimmer)"
        />
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="17"
          stroke="rgba(255, 255, 255, 0.22)"
          strokeWidth="1.5"
          fill="none"
        />

        {/* Ambient inner aura */}
        <circle cx="32" cy="26" r="22" fill="url(#amalfy-aura)" />

        {/* The Monogram A: Geometric Architectural Ribbons */}
        <g filter="url(#amalfy-glow)">
          {/* Left Wing (Services & Craft) */}
          <path
            d="M 18.5 48.5 L 30.2 16.2 C 30.9 14.3 33.1 14.3 33.8 16.2 L 45.5 48.5 C 46 49.8 44.7 51 43.4 50.4 L 38 48 C 37.3 47.7 36.8 47.1 36.5 46.4 L 32 33 L 27.5 46.4 C 27.2 47.1 26.7 47.7 26 48 L 20.6 50.4 C 19.3 51 18 49.8 18.5 48.5 Z"
            fill="url(#amalfy-left)"
          />

          {/* Right Wing Facet Shadow for dimensional 3D depth */}
          <path
            d="M 32 15.5 L 45.5 48.5 C 46 49.8 44.7 51 43.4 50.4 L 38 48 C 37.3 47.7 36.8 47.1 36.5 46.4 L 32 33 Z"
            fill="url(#amalfy-right)"
          />

          {/* Central Keystone Negative Space (Roof Gable / Home) */}
          <path
            d="M 32 23 L 36 31 L 28 31 Z"
            fill="#064E3B"
            opacity="0.9"
          />

          {/* Golden Marketplace Horizon Bridge (Commerce & Escrow) */}
          <path
            d="M 21.5 35 C 20.7 35 20.2 35.8 20.6 36.5 L 22.8 40.5 C 23.2 41.1 23.8 41.5 24.5 41.5 L 39.5 41.5 C 40.2 41.5 40.8 41.1 41.2 40.5 L 43.4 36.5 C 43.8 35.8 43.3 35 42.5 35 Z"
            fill="url(#amalfy-gold)"
            stroke="#FEF3C7"
            strokeWidth="0.8"
          />

          {/* Small Radiant Apex Star (Symbol of Quality & Senegal) */}
          <polygon
            points="32,7.5 33.2,10.2 36.2,10.4 33.8,12.2 34.6,15.1 32,13.4 29.4,15.1 30.2,12.2 27.8,10.4 30.8,10.2"
            fill="#FDE047"
          />
        </g>
      </svg>
    </div>
  );
};

export const AmalfyLogo: React.FC<AmalfyLogoProps> = ({
  variant = 'header',
  theme = 'light',
  size = 'md',
  showSlogan = false,
  showSub = true,
  className = '',
  onClick
}) => {
  // Sizing definitions
  const sizeConfig = {
    xs: { px: 28, text: 'text-base', subText: 'text-[8px]', gap: 'gap-1.5', badgeText: 'text-[9px]' },
    sm: { px: 34, text: 'text-lg', subText: 'text-[9px]', gap: 'gap-2', badgeText: 'text-[10px]' },
    md: { px: 42, text: 'text-xl sm:text-2xl', subText: 'text-[10px]', gap: 'gap-2.5', badgeText: 'text-[11px]' },
    lg: { px: 50, text: 'text-2xl sm:text-3xl', subText: 'text-xs', gap: 'gap-3', badgeText: 'text-xs' },
    xl: { px: 62, text: 'text-3xl sm:text-4xl', subText: 'text-sm', gap: 'gap-3.5', badgeText: 'text-sm' }
  }[size];

  const isDark = theme === 'dark';

  if (variant === 'icon-only') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center cursor-pointer ${className}`}
        role={onClick ? 'button' : undefined}
      >
        <AmalfyEmblem sizePx={sizeConfig.px} />
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center text-left ${sizeConfig.gap} group select-none ${
        onClick ? 'cursor-pointer focus:outline-hidden' : ''
      } ${className}`}
      role={onClick ? 'button' : undefined}
    >
      {/* Brand Emblem */}
      <AmalfyEmblem sizePx={sizeConfig.px} />

      {/* Brand Typography & Slogan */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-heading font-black tracking-tight transition-colors duration-200 ${sizeConfig.text} ${
              isDark
                ? 'text-white group-hover:text-emerald-300'
                : 'text-slate-900 group-hover:text-emerald-700'
            }`}
          >
            AMALFY
          </span>
          <span className="font-heading font-black text-emerald-600 tracking-normal">
            .sn
          </span>

          {variant === 'full' && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 font-bold text-[9px] uppercase tracking-wider ml-1">
              Sénégal
            </span>
          )}
        </div>

        {/* Subline / Categories or Slogan */}
        {showSub && variant !== 'compact' && (
          <p
            className={`mt-1 font-semibold tracking-wide transition-colors ${sizeConfig.subText} ${
              isDark ? 'text-emerald-200/80' : 'text-slate-500 group-hover:text-slate-700'
            }`}
          >
            {showSlogan
              ? '« Le bon service, le bon bien, le bon produit. »'
              : 'Services • Immobilier • Market'}
          </p>
        )}
      </div>
    </div>
  );
};

export default AmalfyLogo;
