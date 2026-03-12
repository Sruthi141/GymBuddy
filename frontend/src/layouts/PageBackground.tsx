import type { ReactNode } from 'react';

interface PageBackgroundProps {
  image: string;
  overlayOpacity?: number;
  blurAmount?: string;
  align?: 'center' | 'top';
  children: ReactNode;
  className?: string;
}

/**
 * Reusable full-page gym-themed background with blur + dark overlay.
 * Ensures readability while keeping strong visual gym imagery.
 */
export default function PageBackground({
  image,
  overlayOpacity = 0.75,
  blurAmount = 'blur-xl',
  align = 'center',
  children,
  className = '',
}: PageBackgroundProps) {
  return (
    <div className={`min-h-screen flex flex-col pt-16 bg-dark-950 ${className}`}>
      <div className="relative flex-1 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={image}
            alt=""
            className={`w-full h-full object-cover ${blurAmount}`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/90"
            style={{ opacity: overlayOpacity }}
          />
        </div>
        <div
          className={`relative z-10 flex px-4 pb-10 ${
            align === 'top' ? 'items-start pt-6' : 'items-center'
          } justify-center`}
        >
          <div className="w-full max-w-7xl mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}


