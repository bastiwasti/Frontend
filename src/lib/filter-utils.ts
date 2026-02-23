import { isValid } from 'date-fns';
import type { Event, BaseFilterState } from '@/types';

/** Returns true if any filter field has a non-empty / non-null value. */
export function hasActiveFilters(filters: BaseFilterState): boolean {
  return Object.values(filters).some(v => {
    if (typeof v === 'object' && v !== null && 'from' in v) {
      const dr = v as { from: Date | undefined; to: Date | undefined };
      return dr.from !== undefined || dr.to !== undefined;
    }
    return v !== '' && v !== null && (typeof v !== 'number' || v !== 0);
  });
}

/** Filters and sorts events by the standard field-based filter state (location/city/category/source/dateRange). */
export function applyEventFilters(events: Event[], filters: BaseFilterState): Event[] {
  return events
    .filter(event => {
      if (filters.location && event.location !== filters.location) return false;
      if (filters.city && event.city !== filters.city) return false;
      if (filters.category && event.category !== filters.category) return false;
      if (filters.source && event.source !== filters.source) return false;

      if (filters.dateRange.from || filters.dateRange.to) {
        const startDate = event.start_datetime ? new Date(event.start_datetime) : null;
        if (!startDate || !isValid(startDate)) return false;
        if (filters.dateRange.from && startDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && startDate > filters.dateRange.to) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA = a.start_datetime ? new Date(a.start_datetime).getTime() : 0;
      const dateB = b.start_datetime ? new Date(b.start_datetime).getTime() : 0;
      return dateA - dateB;
    });
}
