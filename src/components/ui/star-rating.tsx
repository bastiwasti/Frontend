'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number | null;
  onRate?: (rating: number | null) => void;
  size?: 'sm' | 'md';
  isLoading?: boolean;
}

export function StarRating({ rating, onRate, size = 'md', isLoading = false }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const interactive = !!onRate;
  const displayRating = hoverRating ?? rating ?? 0;

  const sizeClasses = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div className={cn('flex items-center gap-0.5', isLoading && 'opacity-50 pointer-events-none')}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive || isLoading}
          className={cn(
            'transition-colors disabled:cursor-default',
            interactive && 'cursor-pointer hover:scale-110'
          )}
          onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); onRate?.(star === rating ? null : star); }}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(null)}
        >
          <Star
            className={cn(
              sizeClasses,
              star <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300 dark:text-gray-600'
            )}
          />
        </button>
      ))}
    </div>
  );
}
