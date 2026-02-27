'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Event, BaseFilterState } from '@/types';
import { useDebounce } from '@/hooks/use-debounce';
import { applyEventFilters, hasActiveFilters } from '@/lib/filter-utils';

const STORAGE_KEY = 'eventFilters';

const DEFAULT_FILTERS: BaseFilterState = {
  location: [],
  city: [],
  category: [],
  source: [],
  origin: [],
  dateRange: { from: undefined },
};

// ── Serialization ──────────────────────────────────────────────────────

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every(item => typeof item === 'string');
}

function serializeFilters(filters: BaseFilterState): string {
  return JSON.stringify({
    location: filters.location,
    city: filters.city,
    category: filters.category,
    source: filters.source,
    origin: filters.origin,
    dateRange: {
      from: filters.dateRange.from?.toISOString() ?? null,
      to: filters.dateRange.to?.toISOString() ?? null,
    },
  });
}

function deserializeFilters(raw: unknown): BaseFilterState {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ...DEFAULT_FILTERS };

  const obj = raw as Record<string, unknown>;

  let from: Date | undefined;
  let to: Date | undefined;
  if (obj.dateRange && typeof obj.dateRange === 'object' && !Array.isArray(obj.dateRange)) {
    const dr = obj.dateRange as Record<string, unknown>;
    if (typeof dr.from === 'string') {
      const d = new Date(dr.from);
      if (!isNaN(d.getTime())) from = d;
    }
    if (typeof dr.to === 'string') {
      const d = new Date(dr.to);
      if (!isNaN(d.getTime())) to = d;
    }
  }

  return {
    location: isStringArray(obj.location) ? obj.location : [],
    city: isStringArray(obj.city) ? obj.city : [],
    category: isStringArray(obj.category) ? obj.category : [],
    source: isStringArray(obj.source) ? obj.source : [],
    origin: isStringArray(obj.origin) ? obj.origin : [],
    dateRange: { from, to },
  };
}

function loadFromStorage(): BaseFilterState {
  try {
    if (typeof window === 'undefined') return { ...DEFAULT_FILTERS };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FILTERS };
    return deserializeFilters(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_FILTERS };
  }
}

function saveToStorage(filters: BaseFilterState): void {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, serializeFilters(filters));
  } catch {
    // QuotaExceededError or private browsing — silently ignore
  }
}

// ── Hook ──────────────────────────────────────────────────────────────

export function useEventFilters(events: Event[], initialFilters?: Partial<BaseFilterState>) {
  const [filters, setFiltersInternal] = useState<BaseFilterState>(() => ({
    ...loadFromStorage(),
    ...initialFilters,
  }));

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToStorage(filters);
  }, [filters]);

  const setFilters = useCallback(
    (patch: BaseFilterState | ((prev: BaseFilterState) => BaseFilterState)) => {
      setFiltersInternal(patch);
    },
    []
  );

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
      origins: Array.from(new Set(events.map(e => e.origin).filter((v): v is string => Boolean(v)))).sort(),
    }),
    [events]
  );

  const clearAllFilters = useCallback(() => {
    setFiltersInternal({ ...DEFAULT_FILTERS });
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
