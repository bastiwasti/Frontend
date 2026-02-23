import { Filter } from 'lucide-react';

interface EventCountBadgeProps {
  count: number;
  isFiltering?: boolean;
}

export function EventCountBadge({ count, isFiltering = false }: EventCountBadgeProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Filter className="w-4 h-4" />
      {isFiltering ? (
        <span className="animate-pulse">Filtering...</span>
      ) : (
        <span>{count} events</span>
      )}
    </div>
  );
}
