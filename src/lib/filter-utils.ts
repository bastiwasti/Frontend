import { isValid } from 'date-fns';
import type { Event, BaseFilterState } from '@/types';

/** Returns true if any filter field has a non-empty / non-null value. */
export function hasActiveFilters(filters: BaseFilterState): boolean {
  return (
    filters.location.length > 0 ||
    filters.city.length > 0 ||
    filters.category.length > 0 ||
    filters.source.length > 0 ||
    filters.origin.length > 0 ||
    filters.dateRange.from !== undefined ||
    filters.dateRange.to !== undefined ||
    filters.minRating !== null
  );
}

/** Filters events. Multiple selections within a field are OR'd; fields are AND'd. */
export function applyEventFilters(events: Event[], filters: BaseFilterState): Event[] {
  const locationSet = filters.location.length > 0 ? new Set(filters.location) : null;
  const citySet = filters.city.length > 0 ? new Set(filters.city) : null;
  const categorySet = filters.category.length > 0 ? new Set(filters.category) : null;
  const sourceSet = filters.source.length > 0 ? new Set(filters.source) : null;
  const originSet = filters.origin.length > 0 ? new Set(filters.origin) : null;

  return events.filter(event => {
    if (locationSet && !locationSet.has(event.location ?? '')) return false;
    if (citySet && !citySet.has(event.city ?? '')) return false;
    if (categorySet && !categorySet.has(event.category ?? '')) return false;
    if (sourceSet && !sourceSet.has(event.source ?? '')) return false;
    if (originSet && !originSet.has(event.origin ?? '')) return false;

    if (filters.dateRange.from || filters.dateRange.to) {
      const startDate = event.start_datetime ? new Date(event.start_datetime) : null;
      if (!startDate || !isValid(startDate)) return false;
      if (filters.dateRange.from && startDate < filters.dateRange.from) return false;
      if (filters.dateRange.to && startDate > filters.dateRange.to) return false;
    }

    if (filters.minRating !== null) {
      if (event.avg_rating !== null && event.avg_rating < filters.minRating) return false;
    }

    return true;
  });
  // Events already sorted by start_datetime ASC from the API
}
