// components/StarRating.tsx
import React from 'react';

type StarRatingProps = {
  rating: number; // može i decimalno npr. 4.5
  max?: number; // default 5
  className?: string; // dodatne klase za wrapper
  starSize?: number; // px veličina zvezdice (default 16)
  label?: string; // tekst pored zvezdica (default "rating")
  showLabel?: boolean; // prikaži/ sakrij label (default true)
};

export default function StarRating({
  rating,
  max = 5,
  className = '',
  starSize = 16,
  label = 'rating',
  showLabel = true,
}: StarRatingProps) {
  const value = Math.max(0, Math.min(rating, max)); // clamp

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      aria-label={`${label} ${value}/${max}`}
    >
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, i) => {
          const starValue = i + 1;
          let fillType: 'full' | 'half' | 'empty' = 'empty';

          if (value >= starValue) fillType = 'full';
          else if (value >= starValue - 0.5) fillType = 'half';

          return <Star key={i} type={fillType} size={starSize} />;
        })}
      </div>

      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {label} {value}/{max}
        </span>
      )}
    </div>
  );
}

function Star({
  type,
  size = 16,
}: {
  type: 'full' | 'half' | 'empty';
  size?: number;
}) {
  if (type === 'full') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="text-yellow-400"
        fill="currentColor"
      >
        <path d="M12 17.27 5.8 21l1.18-7.03L2 8.9l7.06-1.03L12 1.5l2.94 6.37L22 8.9l-4.98 5.07L18.2 21 12 17.27z" />
      </svg>
    );
  }

  if (type === 'half') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="text-yellow-400"
      >
        <defs>
          <linearGradient id="half-fill" x1="0" x2="100%" y1="0" y2="0">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 17.27 5.8 21l1.18-7.03L2 8.9l7.06-1.03L12 1.5l2.94 6.37L22 8.9l-4.98 5.07L18.2 21 12 17.27z"
          fill="url(#half-fill)"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="text-gray-300 dark:text-gray-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
    >
      <path d="M12 17.27 5.8 21l1.18-7.03L2 8.9l7.06-1.03L12 1.5l2.94 6.37L22 8.9l-4.98 5.07L18.2 21 12 17.27z" />
    </svg>
  );
}
