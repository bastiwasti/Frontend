'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { X, Filter, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { BaseFilterState } from '@/types';

interface EventFiltersPanelProps {
  filters: BaseFilterState;
  onFiltersChange: (filters: BaseFilterState) => void;
  uniqueLocations: string[];
  uniqueCities: string[];
  uniqueCategories: string[];
  uniqueSources: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isLoading?: boolean;
  showDateRangePicker?: boolean;
  extraFilters?: React.ReactNode;
}

export function EventFiltersPanel({
  filters,
  onFiltersChange,
  uniqueLocations,
  uniqueCities,
  uniqueCategories,
  uniqueSources,
  hasActiveFilters,
  onClearFilters,
  isLoading = false,
  showDateRangePicker = false,
  extraFilters,
}: EventFiltersPanelProps) {
  const update = (patch: Partial<BaseFilterState>) => onFiltersChange({ ...filters, ...patch });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h2>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-red-600 hover:text-red-700">
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {extraFilters}

        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <Select
            value={filters.location || 'all'}
            onValueChange={(v) => update({ location: v === 'all' ? '' : v })}
            disabled={isLoading}
          >
            <SelectTrigger><SelectValue placeholder="All locations" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {uniqueLocations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">City</label>
          <Select
            value={filters.city || 'all'}
            onValueChange={(v) => update({ city: v === 'all' ? '' : v })}
            disabled={isLoading}
          >
            <SelectTrigger><SelectValue placeholder="All cities" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {uniqueCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            value={filters.category || 'all'}
            onValueChange={(v) => update({ category: v === 'all' ? '' : v })}
            disabled={isLoading}
          >
            <SelectTrigger><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Source</label>
          <Select
            value={filters.source || 'all'}
            onValueChange={(v) => update({ source: v === 'all' ? '' : v })}
            disabled={isLoading}
          >
            <SelectTrigger><SelectValue placeholder="All sources" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sources</SelectItem>
              {uniqueSources.map(s => (
                <SelectItem key={s} value={s}>
                  {s.length > 30 ? `${s.substring(0, 30)}...` : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showDateRangePicker && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>{format(filters.dateRange.from, 'MMM d, yyyy')} - {format(filters.dateRange.to, 'MMM d, yyyy')}</>
                    ) : (
                      format(filters.dateRange.from, 'MMM d, yyyy')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={(range) => update({ dateRange: range || { from: undefined } })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </div>
  );
}
