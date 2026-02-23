'use client';

import { useState, useMemo, useCallback } from 'react';
import type { Event, BaseFilterState } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import { applyEventFilters, hasActiveFilters } from '@/lib/filter-utils';

const DEFAULT_FILTERS: BaseFilterState = {
  location: '',
  city: '',
  category: '',
  source: '',
  dateRange: { from: undefined },
};

export function useEventFilters(events: Event[], initialFilters?: Partial<BaseFilterState>) {
  const [filters, setFilters] = useState<BaseFilterState>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const debouncedFilters = useDebounce(filters, 300);

  const isFiltering = filters !== debouncedFilters;

  const filteredEvents = useMemo(
    () => applyEventFilters(events, debouncedFilters),
    [events, debouncedFilters]
  );

  const uniqueValues = useMemo(
    () => ({
      locations: Array.from(new Set(events.map(e => e.location).filter((v): v is string => Boolean(v)))).sort(),
      cities: Array.from(new Set(events.map(e => e.city).filter((v): v is string => Boolean(v)))).sort(),
      categories: Array.from(new Set(events.map(e => e.category).filter((v): v is string => Boolean(v)))).sort(),
      sources: Array.from(new Set(events.map(e => e.source).filter((v): v is string => Boolean(v)))).sort(),
    }),
    [events]
  );

  const clearAllFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const isActive = useMemo(() => hasActiveFilters(debouncedFilters), [debouncedFilters]);

  return {
    filters,
    setFilters,
    debouncedFilters,
    filteredEvents,
    uniqueValues,
    clearAllFilters,
    isActive,
    isFiltering,
  };
}
