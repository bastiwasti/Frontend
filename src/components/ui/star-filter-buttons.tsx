'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarFilterButtonsProps {
  minRating: number | null;
  onRatingChange: (rating: number | null) => void;
}

export function StarFilterButtons({ minRating, onRatingChange }: StarFilterButtonsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4].map((rating) => (
        <button
          key={rating}
          onClick={() => onRatingChange(minRating === rating ? null : rating)}
          className={cn(
            'flex items-center gap-0.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all border',
            minRating === rating
              ? 'bg-primary text-primary-foreground shadow-lg'
              : 'bg-background text-muted-foreground hover:bg-muted'
          )}
          title={`${rating}+ stars`}
        >
          {Array.from({ length: rating }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                minRating === rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none'
              )}
            />
          ))}
          <span className="ml-0.5">+</span>
        </button>
      ))}
    </div>
  );
}
