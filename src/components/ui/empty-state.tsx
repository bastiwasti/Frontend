import { Filter } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = 'No events found',
  description = 'Try adjusting your filters or clear all filters to see all events.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Filter className="mx-auto h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
