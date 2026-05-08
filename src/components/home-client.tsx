'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { CalendarMonthGrid } from '@/components/calendar/calendar-week-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { EventDetailsModal } from '@/components/calendar/event-details-modal';
import { DayEventsModal } from '@/components/calendar/day-events-modal';
import { formatDateLocal } from '@/lib/event-utils';
import { cn } from '@/lib/utils';
import { Footprints, Bike, Car, Search, X, MapPin } from 'lucide-react';
import { HometownImageBox } from '@/components/layout/page-background';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarFilterButtons } from '@/components/ui/star-filter-buttons';
import type { Event } from '@/types';

type DistanceFilter = 'walk' | 'bike' | 'car' | null;
const distanceOptions: { key: 'walk' | 'bike' | 'car'; icon: typeof Footprints; label: string; test: (km: number) => boolean }[] = [
  { key: 'walk', icon: Footprints, label: '< 1 km', test: (km) => km < 1 },
  { key: 'bike', icon: Bike, label: '< 10 km', test: (km) => km < 10 },
  { key: 'car', icon: Car, label: 'all', test: () => true },
];

const distanceFetcher = (url: string) => fetch(url).then(r => r.json());

interface HomeClientProps {
  initialEvents: Event[];
  initialUserRatings: Record<number, number>;
  cities: string[];
}

export function HomeClient({ initialEvents, initialUserRatings, cities }: HomeClientProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [userRatings, setUserRatings] = useState<Record<number, number>>(initialUserRatings);

  const [homeCity, setHomeCity] = useState<string>(() => {
    try { return localStorage.getItem('homeCity') ?? 'monheim_am_rhein'; } catch { return 'monheim_am_rhein'; }
  });
  useEffect(() => {
    try { localStorage.setItem('homeCity', homeCity); } catch {}
  }, [homeCity]);

  const citiesParam = cities.map(c => encodeURIComponent(c)).join(',');
  const { data: distances, isLoading: isGeocoding } = useSWR<Record<string, number | null>>(
    homeCity && cities.length > 0
      ? `/api/city-road-distances?home=${encodeURIComponent(homeCity)}&cities=${citiesParam}`
      : null,
    distanceFetcher,
    { revalidateOnFocus: false, dedupingInterval: 300000 }
  );

  const getDistanceKm = useCallback(
    (city: string | null): number | null => (!city || !distances ? null : distances[city] ?? null),
    [distances]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

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
    if (distanceFilter && distances) {
      const { test } = distanceOptions.find(o => o.key === distanceFilter)!;
      result = result.filter(e => {
        const km = distances[e.city ?? ''] ?? null;
        return km !== null && test(km);
      });
    }
    if (minRating !== null) {
      result = result.filter(e => e.avg_rating === null || e.avg_rating >= minRating);
    }
    return result;
  }, [events, searchQuery, distanceFilter, minRating, distances]);

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

  const updateEventRating = useCallback(
    (eventId: number, userRating: number | null, avgRating: number | null, ratingCount: number) => {
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? { ...e, avg_rating: avgRating, rating_count: ratingCount, user_rating: userRating }
            : e
        )
      );
      if (userRating !== null) {
        setUserRatings(prev => ({ ...prev, [eventId]: userRating }));
      } else {
        setUserRatings(prev => {
          const next = { ...prev };
          delete next[eventId];
          return next;
        });
      }
    },
    []
  );

  const homeCityOptions = Array.from(new Set(['monheim_am_rhein', ...cities])).sort();
  const hasActiveFilters = searchQuery !== '' || distanceFilter !== null || minRating !== null;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="rounded-2xl overflow-hidden border shadow-2xl relative">
            <HometownImageBox hometown={homeCity} />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">Home:</span>
                </div>
                <div className="flex items-center gap-3">
                  <Select
                    value={homeCity}
                    onValueChange={setHomeCity}
                    disabled={isGeocoding}
                  >
                    <SelectTrigger className="h-8 w-48 text-sm bg-white/10 border-white/20 text-white backdrop-blur-sm focus:ring-2 focus:ring-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {homeCityOptions.map(city => (
                        <SelectItem key={city} value={city} className="capitalize">
                          {city.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isGeocoding && (
                    <span className="text-xs text-white/70 animate-pulse">Loading...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-3 p-4 bg-card rounded-xl border">
            <div className="relative flex-1 min-w-[160px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border',
                  distanceFilter === key
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-background text-muted-foreground hover:bg-muted',
                  isGeocoding && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
            <StarFilterButtons minRating={minRating} onRatingChange={setMinRating} />
            {hasActiveFilters && (
              <button
                onClick={() => { setSearchQuery(''); setDistanceFilter(null); setMinRating(null); }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {displayedEvents.length === 0 ? (
          <div className="bg-card rounded-xl border p-12">
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
