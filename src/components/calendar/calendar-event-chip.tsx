'use client';

import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarEventChipProps {
  event: {
    id: number;
    name: string;
    category: string | null;
    city: string | null;
  };
  onClick: () => void;
  colorClass: string;
  showCity?: boolean;
}

export function CalendarEventChip({ event, onClick, colorClass, showCity = false }: CalendarEventChipProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const cityInitials = event.city ? event.city.substring(0, 4).toUpperCase() : null;

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative w-full cursor-pointer rounded p-1.5 text-xs transition-all hover:scale-105 hover:brightness-105',
        colorClass
      )}
      role="button"
      tabIndex={0}
    >
      {showCity && cityInitials && (
        <div className="absolute left-1 top-1 flex items-center gap-0.5 rounded bg-black/20 px-1 py-0.5 text-[10px] font-medium">
          <MapPin className="h-2.5 w-2.5" />
          <span className="truncate">{cityInitials}</span>
        </div>
      )}
      <div className="ml-1.5 line-clamp-2 font-medium leading-tight">
        {event.name}
      </div>
    </div>
  );
}
