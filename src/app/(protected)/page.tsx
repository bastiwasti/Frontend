'use client';

import { useState, useMemo, useCallback } from 'react';
import { useEvents } from '@/hooks/use-events';
import { useEventFilters } from '@/hooks/use-event-filters';
import { useEventColors } from '@/hooks/use-event-colors';
import { EventFiltersPanel } from '@/components/events/event-filters-panel';
import { EventCountBadge } from '@/components/events/event-count-badge';
import { ColorLegend } from '@/components/calendar/color-legend';
import { CalendarWeekGrid } from '@/components/calendar/calendar-week-grid';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { EventDetailsModal } from '@/components/calendar/event-details-modal';
import { DayEventsModal } from '@/components/calendar/day-events-modal';
import { formatDateLocal } from '@/lib/event-utils';
import type { Event } from '@/types';

export default function Home() {
  const { events, isLoading } = useEvents();
  const { filters, setFilters, filteredEvents, uniqueValues, clearAllFilters, isActive, isFiltering } = useEventFilters(events);
  const { colorMode, setColorMode, cityColors, categoryColors, getColor } = useEventColors(uniqueValues.cities, uniqueValues.categories);

  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[] | null>(null);

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    filteredEvents.forEach((event) => {
      if (!event.start_datetime) return;
      const dateKey = formatDateLocal(new Date(event.start_datetime));
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  const handleDayClick = useCallback((date: Date) => {
    const dateKey = formatDateLocal(date);
    setSelectedDayEvents(eventsByDate[dateKey] || []);
  }, [eventsByDate]);

  const navigatePrev = useCallback(() => {
    setReferenceDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7));
  }, []);

  const navigateNext = useCallback(() => {
    setReferenceDate(d => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7));
  }, []);

  const resetToToday = useCallback(() => setReferenceDate(new Date()), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Events Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400">Browse events by date</p>
          </div>
          <EventCountBadge count={filteredEvents.length} isFiltering={isFiltering} />
        </div>

        <EventFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          uniqueLocations={uniqueValues.locations}
          uniqueCities={uniqueValues.cities}
          uniqueCategories={uniqueValues.categories}
          uniqueSources={uniqueValues.sources}
          hasActiveFilters={isActive}
          onClearFilters={clearAllFilters}
          isLoading={isLoading}
        />

        {isLoading ? (
          <LoadingSpinner message="Loading events..." />
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <EmptyState />
          </div>
        ) : (
          <>
            <ColorLegend
              colorMode={colorMode}
              onToggleColorMode={() => setColorMode(colorMode === 'city' ? 'category' : 'city')}
              uniqueCities={uniqueValues.cities}
              uniqueCategories={uniqueValues.categories}
              cityColors={cityColors}
              categoryColors={categoryColors}
            />
            <CalendarWeekGrid
              referenceDate={referenceDate}
              eventsByDate={eventsByDate}
              onNavigatePrev={navigatePrev}
              onNavigateNext={navigateNext}
              onResetToToday={resetToToday}
              onDayClick={handleDayClick}
              onEventClick={setSelectedEvent}
              getColor={getColor}
            />
          </>
        )}

        <DayEventsModal
          date={selectedDayEvents?.length ? new Date(selectedDayEvents[0].start_datetime || '') : null}
          events={selectedDayEvents || []}
          onClose={() => setSelectedDayEvents(null)}
          onEventClick={setSelectedEvent}
        />
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </div>
    </div>
  );
}
