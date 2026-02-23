'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEvents } from '@/hooks/use-events';
import { useRuns } from '@/hooks/use-runs';
import { useEventFilters } from '@/hooks/use-event-filters';
import { EventFiltersPanel } from '@/components/events/event-filters-panel';
import { EventCard } from '@/components/events/event-card';
import { EventCountBadge } from '@/components/events/event-count-badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import type { BaseFilterState } from '@/types';

export default function CalendarPage() {
  const { events, isLoading } = useEvents();
  const { runs } = useRuns();
  const { filters, setFilters, filteredEvents, uniqueValues, clearAllFilters, isActive } = useEventFilters(events);
  const [expandedEventIds, setExpandedEventIds] = useState<Set<number>>(new Set());
  const [runIdFilter, setRunIdFilter] = useState<number | null>(null);

  const displayedEvents = runIdFilter !== null
    ? filteredEvents.filter(e => e.run_id === runIdFilter)
    : filteredEvents;

  const toggleExpand = (eventId: number) => {
    setExpandedEventIds(prev => {
      const next = new Set(prev);
      next.has(eventId) ? next.delete(eventId) : next.add(eventId);
      return next;
    });
  };

  const handleClearAll = () => {
    clearAllFilters();
    setRunIdFilter(null);
  };

  const hasAnyActiveFilters = isActive || runIdFilter !== null;

  const runIdSelect = (
    <div className="space-y-2">
      <label className="text-sm font-medium">Run ID</label>
      <Select
        value={runIdFilter?.toString() || 'all'}
        onValueChange={(v) => setRunIdFilter(v === 'all' ? null : Number(v))}
      >
        <SelectTrigger>
          <SelectValue placeholder="All runs" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All runs</SelectItem>
          {runs.map(run => (
            <SelectItem key={run.id} value={run.id.toString()}>
              Run {run.id} - {run.agent}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Events Gallery</h1>
            <p className="text-gray-600 dark:text-gray-400">Browse and filter through discovered events</p>
          </div>
          <EventCountBadge count={displayedEvents.length} />
        </div>

        <EventFiltersPanel
          filters={filters}
          onFiltersChange={(f: BaseFilterState) => setFilters(f)}
          uniqueLocations={uniqueValues.locations}
          uniqueCities={uniqueValues.cities}
          uniqueCategories={uniqueValues.categories}
          uniqueSources={uniqueValues.sources}
          hasActiveFilters={hasAnyActiveFilters}
          onClearFilters={handleClearAll}
          isLoading={isLoading}
          showDateRangePicker
          extraFilters={runIdSelect}
        />

        {isLoading ? (
          <LoadingSpinner message="Loading events..." />
        ) : displayedEvents.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <EmptyState />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isExpanded={expandedEventIds.has(event.id)}
                onToggleExpand={() => toggleExpand(event.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
