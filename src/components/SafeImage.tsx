import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  categoryPlaceholder?: 'service' | 'real-estate' | 'market' | 'avatar';
}

const DEFAULT_FALLBACKS: Record<string, string> = {
  service: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
  'real-estate': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
  market: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
};

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = 'AMALFY illustration',
  className = '',
  fallbackSrc,
  categoryPlaceholder = 'market',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const fallback = fallbackSrc || DEFAULT_FALLBACKS[categoryPlaceholder] || DEFAULT_FALLBACKS.market;
  const imageSource = hasError || !src ? fallback : src;

  return (
    <img
      src={imageSource}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        if (!hasError) {
          setHasError(true);
        }
      }}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-80'
      }`}
      {...props}
    />
  );
};
