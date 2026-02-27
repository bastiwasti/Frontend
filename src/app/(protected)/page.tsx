'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useEvents } from '@/hooks/use-events';
import { useEventFilters } from '@/hooks/use-event-filters';
import { useCityDistances } from '@/hooks/use-city-distances';
import { EventFiltersPanel } from '@/components/events/event-filters-panel';
import { CalendarMonthGrid } from '@/components/calendar/calendar-week-grid';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { EventDetailsModal } from '@/components/calendar/event-details-modal';
import { DayEventsModal } from '@/components/calendar/day-events-modal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDateLocal } from '@/lib/event-utils';
import type { Event } from '@/types';

export default function Home() {
  const { events, isLoading } = useEvents();
  const { filters, setFilters, filteredEvents, uniqueValues, clearAllFilters, isActive } = useEventFilters(events);

  const [homeCity, setHomeCity] = useState<string>(() => {
    try { return localStorage.getItem('homeCity') ?? 'Monheim am Rhein'; } catch { return 'Monheim am Rhein'; }
  });
  useEffect(() => {
    try { localStorage.setItem('homeCity', homeCity); } catch {}
  }, [homeCity]);

  const { getDistanceKm, isLoading: isGeocoding } = useCityDistances(uniqueValues.cities, homeCity);

  const [originFilter, setOriginFilter] = useState<string>('');

  const displayedEvents = useMemo(
    () => originFilter ? filteredEvents.filter(e => e.origin === originFilter) : filteredEvents,
    [filteredEvents, originFilter]
  );

  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[] | null>(null);

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    displayedEvents.forEach((event) => {
      if (!event.start_datetime) return;
      const dateKey = formatDateLocal(new Date(event.start_datetime));
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [displayedEvents]);

  const handleDayClick = useCallback((date: Date) => {
    const dateKey = formatDateLocal(date);
    setSelectedDayEvents(eventsByDate[dateKey] || []);
  }, [eventsByDate]);

  const navigatePrev = useCallback(() => {
    setReferenceDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const navigateNext = useCallback(() => {
    setReferenceDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const resetToToday = useCallback(() => setReferenceDate(new Date()), []);

  const homeCityOptions = Array.from(new Set(['Monheim am Rhein', ...uniqueValues.cities])).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{displayedEvents.length} Events</h1>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
            <span>Home city:</span>
            <Select value={homeCity} onValueChange={setHomeCity}>
              <SelectTrigger className="h-7 w-52 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {homeCityOptions.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isGeocoding && (
              <span className="text-xs text-gray-400 animate-pulse">Geocoding…</span>
            )}
          </div>
        </div>

        <EventFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          uniqueLocations={uniqueValues.locations}
          uniqueCities={uniqueValues.cities}
          uniqueCategories={uniqueValues.categories}
          uniqueSources={[]}
          hasActiveFilters={isActive || originFilter !== ''}
          onClearFilters={() => { clearAllFilters(); setOriginFilter(''); }}
          isLoading={isLoading}
          extraFilters={
            <div className="space-y-2">
              <label className="text-sm font-medium">Origin</label>
              <Select
                value={originFilter || 'all'}
                onValueChange={(v) => setOriginFilter(v === 'all' ? '' : v)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All origins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All origins</SelectItem>
                  {(uniqueValues.origins || []).map(origin => (
                    <SelectItem key={origin} value={origin}>{origin}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        />

        {isLoading ? (
          <LoadingSpinner message="Loading events..." />
        ) : displayedEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <EmptyState />
          </div>
        ) : (
          <CalendarMonthGrid
            referenceDate={referenceDate}
            eventsByDate={eventsByDate}
            onNavigatePrev={navigatePrev}
            onNavigateNext={navigateNext}
            onResetToToday={resetToToday}
            onDayClick={handleDayClick}
          />

        )}

        <DayEventsModal
          date={selectedDayEvents?.length && !selectedEvent ? new Date(selectedDayEvents[0].start_datetime || '') : null}
          events={selectedDayEvents || []}
          onClose={() => setSelectedDayEvents(null)}
          onEventClick={setSelectedEvent}
          getDistanceKm={getDistanceKm}
          homeCity={homeCity}
        />
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </div>
    </div>
  );
}
