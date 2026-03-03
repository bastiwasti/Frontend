'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useEvents } from '@/hooks/use-events';
import { useCityDistances } from '@/hooks/use-city-distances';
import { CalendarMonthGrid } from '@/components/calendar/calendar-week-grid';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { EventDetailsModal } from '@/components/calendar/event-details-modal';
import { DayEventsModal } from '@/components/calendar/day-events-modal';
import { formatDateLocal } from '@/lib/event-utils';
import { cn } from '@/lib/utils';
import { Footprints, Bike, Car, Search, X } from 'lucide-react';
import { HometownSelector } from '@/components/layout/hometown-selector';
import type { Event } from '@/types';

type DistanceFilter = 'walk' | 'bike' | 'car' | null;
const distanceOptions: { key: 'walk' | 'bike' | 'car'; icon: typeof Footprints; label: string; test: (km: number) => boolean }[] = [
  { key: 'walk', icon: Footprints, label: '< 1 km', test: (km) => km < 1 },
  { key: 'bike', icon: Bike, label: '< 10 km', test: (km) => km < 10 },
  { key: 'car', icon: Car, label: 'all', test: () => true },
];

export default function Home() {
  const { events, isLoading, updateEventRating } = useEvents();

  const [homeCity, setHomeCity] = useState<string>(() => {
    try { return localStorage.getItem('homeCity') ?? 'monheim_am_rhein'; } catch { return 'monheim_am_rhein'; }
  });
  useEffect(() => {
    try { localStorage.setItem('homeCity', homeCity); } catch {}
  }, [homeCity]);

  const uniqueCities = useMemo(
    () => Array.from(new Set(events.map(e => e.city).filter((v): v is string => Boolean(v)))).sort(),
    [events]
  );

  const { getDistanceKm, isLoading: isGeocoding } = useCityDistances(uniqueCities, homeCity);

  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>(null);

  const displayedEvents = useMemo(() => {
    let result = events;
    if (searchQuery.trim()) {
      const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
      result = result.filter(e => {
        const haystack = [e.name, e.description, e.location, e.city, e.category]
          .filter(Boolean).join(' ').toLowerCase();
        return terms.every(term => haystack.includes(term));
      });
    }
    if (distanceFilter) {
      const { test } = distanceOptions.find(o => o.key === distanceFilter)!;
      result = result.filter(e => {
        const km = getDistanceKm(e.city ?? null);
        return km !== null && test(km);
      });
    }
    return result;
  }, [events, searchQuery, distanceFilter, getDistanceKm]);

  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

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

  const selectedDayEvents = selectedDateKey ? (eventsByDate[selectedDateKey] || []) : null;
  const selectedEvent = selectedEventId ? (displayedEvents.find(e => e.id === selectedEventId) ?? null) : null;

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDateKey(formatDateLocal(date));
  }, []);

  const navigatePrev = useCallback(() => {
    setReferenceDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }, []);

  const navigateNext = useCallback(() => {
    setReferenceDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }, []);

  const resetToToday = useCallback(() => setReferenceDate(new Date()), []);

  const homeCityOptions = Array.from(new Set(['monheim_am_rhein', ...uniqueCities])).sort();
  const hasActiveFilters = searchQuery !== '' || distanceFilter !== null;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-5xl font-bold tracking-tight text-foreground">
              {displayedEvents.length} Events
            </h1>
            <HometownSelector
              hometown={homeCity}
              onHometownChange={setHomeCity}
              availableCities={homeCityOptions}
              isGeocoding={isGeocoding}
            />
          </div>
          <div className="flex items-center gap-3 mt-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {distanceOptions.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setDistanceFilter(prev => prev === key ? null : key)}
                disabled={isGeocoding}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                  distanceFilter === key
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700',
                  isGeocoding && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                onClick={() => { setSearchQuery(''); setDistanceFilter(null); }}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

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
          date={selectedDateKey ? new Date(selectedDateKey + 'T00:00:00') : null}
          events={selectedDayEvents || []}
          onClose={() => setSelectedDateKey(null)}
          onEventClick={(event) => setSelectedEventId(event.id)}
          getDistanceKm={getDistanceKm}
          homeCity={homeCity}
        />
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEventId(null)} onRatingChange={updateEventRating} />
      </div>
    </div>
  );
}
