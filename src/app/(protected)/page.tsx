'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { format, isValid, isSameDay } from 'date-fns';
import { CalendarEventChip } from '@/components/calendar/calendar-event-chip';
import { EventDetailsModal } from '@/components/calendar/event-details-modal';
import { DayEventsModal } from '@/components/calendar/day-events-modal';
import { useDebounce } from '@/hooks/use-debounce';

interface Event {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  city: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  category: string | null;
  source: string | null;
  created_at: string;
}

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

interface FilterState {
  location: string;
  city: string;
  category: string;
  source: string;
  dateRange: DateRange;
}

interface CalendarDay {
  date: Date | null;
  dateKey: string;
  events: Event[];
}

interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<Event[] | null>(null);
  const [colorMode, setColorMode] = useState<'city' | 'category' | 'source' | 'location'>('city');
  const [filters, setFilters] = useState<FilterState>({
    location: '',
    city: '',
    category: '',
    source: '',
    dateRange: { from: undefined },
  });

  const debouncedFilters = useDebounce(filters, 300);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
        console.log('Fetched events:', eventsData.length);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setIsFiltering(true);
    const timer = setTimeout(() => {
      setIsFiltering(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedFilters]);

  const eventsByDate = useMemo(() => {
    if (!events.length) return {};
    
    const grouped: Record<string, Event[]> = {};
    
    events.forEach(event => {
      if (!event.start_datetime) return;
      
      const startDate = new Date(event.start_datetime);
      
      if (event.end_datetime) {
        const endDate = new Date(event.end_datetime);
        const currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
          const dateKey = format(currentDate, 'yyyy-MM-dd');
          if (!grouped[dateKey]) grouped[dateKey] = [];
          grouped[dateKey].push(event);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else {
        const dateKey = format(startDate, 'yyyy-MM-dd');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(event);
      }
    });
    
    return grouped;
  }, [events]);

  const handleDayClick = useCallback((date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setSelectedDayEvents(eventsByDate[dateKey] || []);
  }, [eventsByDate]);

  const colorPalette = [
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-100',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100',
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-100',
    'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-100',
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100',
    'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-100',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-100',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100',
    'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-100',
  ];

  const uniqueCities = useMemo(() => {
    if (!events.length) return [];
    return Array.from(new Set(events.map(e => e.city).filter((c): c is string => Boolean(c)))).sort();
  }, [events]);

  const uniqueLocations = useMemo(() => {
    if (!events.length) return [];
    return Array.from(new Set(events.map(e => e.location).filter((l): l is string => Boolean(l)))).sort();
  }, [events]);

  const uniqueCategories = useMemo(() => {
    if (!events.length) return [];
    return Array.from(new Set(events.map(e => e.category).filter((c): c is string => Boolean(c)))).sort();
  }, [events]);

  const uniqueSources = useMemo(() => {
    if (!events.length) return [];
    return Array.from(new Set(events.map(e => e.source).filter((s): s is string => Boolean(s)))).sort();
  }, [events]);

  const cityColors = useMemo(() => {
    const colors: Record<string, string> = {};
    uniqueCities.forEach((city, index) => {
      colors[city] = colorPalette[index % colorPalette.length];
    });
    return colors;
  }, [uniqueCities]);

  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    uniqueCategories.forEach((category, index) => {
      colors[category] = colorPalette[index % colorPalette.length];
    });
    return colors;
  }, [uniqueCategories]);

  const sourceColors = useMemo(() => {
    const colors: Record<string, string> = {};
    uniqueSources.forEach((source, index) => {
      colors[source] = colorPalette[index % colorPalette.length];
    });
    return colors;
  }, [uniqueSources]);

  const locationColors = useMemo(() => {
    const colors: Record<string, string> = {};
    uniqueLocations.forEach((location, index) => {
      colors[location] = colorPalette[index % colorPalette.length];
    });
    return colors;
  }, [uniqueLocations]);

  const getColor = useCallback((value: string | null): string => {
    if (!value) return colorPalette[0];

    switch (colorMode) {
      case 'city':
        return cityColors[value] || colorPalette[0];
      case 'category':
        return categoryColors[value] || colorPalette[0];
      case 'source':
        return sourceColors[value] || colorPalette[0];
      case 'location':
        return locationColors[value] || colorPalette[0];
      default:
        return colorPalette[0];
    }
  }, [colorMode, cityColors, categoryColors, sourceColors, locationColors]);

  const windowDateRange = useMemo(() => {
    const start = new Date(referenceDate);
    const end = new Date(referenceDate);
    end.setDate(end.getDate() + 6);
    return { from: start, to: end };
  }, [referenceDate]);

  const filteredEvents = useMemo(() => {
    if (!events.length) return [];

    return events
      .filter(event => {
        if (debouncedFilters.location && event.location !== debouncedFilters.location) return false;
        if (debouncedFilters.city && event.city !== debouncedFilters.city) return false;
        if (debouncedFilters.category && event.category !== debouncedFilters.category) return false;
        if (debouncedFilters.source && event.source !== debouncedFilters.source) return false;
        
        const eventDate = event.start_datetime ? new Date(event.start_datetime) : null;
        
        if (debouncedFilters.dateRange.from || debouncedFilters.dateRange.to) {
          if (!eventDate || !isValid(eventDate)) return false;
          
          if (debouncedFilters.dateRange.from && eventDate < debouncedFilters.dateRange.from) return false;
          if (debouncedFilters.dateRange.to && eventDate > debouncedFilters.dateRange.to) return false;
        }
        
        if (windowDateRange.from || windowDateRange.to) {
          if (!eventDate || !isValid(eventDate)) return false;
          
          if (windowDateRange.from && eventDate < windowDateRange.from) return false;
          if (windowDateRange.to && eventDate > windowDateRange.to) return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        const dateA = a.start_datetime ? new Date(a.start_datetime).getTime() : 0;
        const dateB = b.start_datetime ? new Date(b.start_datetime).getTime() : 0;
        return dateA - dateB;
      });
  }, [events, debouncedFilters, windowDateRange]);

  const clearAllFilters = useCallback(() => {
    setFilters({
      location: '',
      city: '',
      category: '',
      source: '',
      dateRange: { from: undefined },
    });
  }, []);

  const resetToToday = useCallback(() => {
    setReferenceDate(new Date());
  }, []);

  const hasActiveFilters = useMemo(() => {
    return Object.values(debouncedFilters).some(v => {
      if (typeof v === 'object' && v !== null && 'from' in v) {
        return (v as { from: Date | undefined; to: Date | undefined }).from !== undefined || 
               (v as { from: Date | undefined; to: Date | undefined }).to !== undefined;
      }
      return v !== '' && v !== null && (typeof v !== 'number' || v !== 0);
    });
  }, [debouncedFilters]);

  const renderCalendar = useCallback(() => {
    const start = new Date(referenceDate);
    const end = new Date(referenceDate);
    end.setDate(end.getDate() + 6);
    
    const weeks: CalendarWeek[] = [];
    const filteredEventsSet = new Set(filteredEvents);
    
    const referenceDayOfWeek = referenceDate.getDay();
    const daysBack = referenceDayOfWeek === 0 ? 6 : referenceDayOfWeek - 1;
    
    const mondayOfWindow = new Date(referenceDate);
    mondayOfWindow.setDate(referenceDate.getDate() - daysBack);
    
    const days: CalendarDay[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(mondayOfWindow);
      currentDate.setDate(mondayOfWindow.getDate() + i);
      
      const dateKey = format(currentDate, 'yyyy-MM-dd');
      const dayEvents = (eventsByDate[dateKey] || []).filter(e => filteredEventsSet.has(e));
      
      const dateNum = currentDate.getDate();
      const now = new Date();
      const isToday = (
        currentDate.getFullYear() === now.getFullYear() &&
        currentDate.getMonth() === now.getMonth() &&
        dateNum === now.getDate()
      );
      
      days.push({
        date: currentDate,
        dateKey,
        events: dayEvents
      });
    }
    
    weeks.push({ days, weekNumber: 1 });
    
    return weeks;
  }, [referenceDate, eventsByDate, filteredEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Events Calendar</h1>
            <p className="text-gray-600 dark:text-gray-400">Browse events by date</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            {isFiltering ? (
              <>
                <span className="animate-pulse">Filtering...</span>
              </>
            ) : (
              <span>{filteredEvents.length} events</span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select 
                value={filters.location || 'all'} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, location: v === 'all' ? '' : v }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {uniqueLocations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> 

            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Select 
                value={filters.city || 'all'} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, city: v === 'all' ? '' : v }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cities</SelectItem>
                  {uniqueCities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> 

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={filters.category || 'all'} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, category: v === 'all' ? '' : v }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div> 

            <div className="space-y-2">
              <label className="text-sm font-medium">Source</label>
              <Select 
                value={filters.source || 'all'} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, source: v === 'all' ? '' : v }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All sources</SelectItem>
                  {uniqueSources.map(source => (
                    <SelectItem key={source} value={source}>
                      {source.length > 30 ? `${source.substring(0, 30)}...` : source}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-16 text-center shadow-sm">
            <Filter className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
            <p className="text-gray-500 text-center">Try adjusting your filters or clear all filters to see all events.</p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium capitalize">{colorMode}s</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const modes: Array<'city' | 'category' | 'source' | 'location'> = ['city', 'category', 'source', 'location'];
                    const currentIndex = modes.indexOf(colorMode);
                    const nextMode = modes[(currentIndex + 1) % modes.length];
                    setColorMode(nextMode);
                  }}
                  className="flex items-center gap-2"
                >
                  <Palette className="w-4 h-4" />
                  <span className="text-xs">Change Color</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {colorMode === 'city' && uniqueCities.map(city => (
                  <div key={city} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${cityColors[city] || colorPalette[0]}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{city}</span>
                  </div>
                ))}
                {colorMode === 'category' && uniqueCategories.map(category => (
                  <div key={category} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${categoryColors[category] || colorPalette[0]}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category}</span>
                  </div>
                ))}
                {colorMode === 'source' && uniqueSources.map(source => (
                  <div key={source} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${sourceColors[source] || colorPalette[0]}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{source}</span>
                  </div>
                ))}
                {colorMode === 'location' && uniqueLocations.map(location => (
                  <div key={location} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${locationColors[location] || colorPalette[0]}`}></div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{location}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <div className="flex items-center justify-between p-4 mb-4">
              <button
                onClick={() => setReferenceDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - 7))}
                className="px-3 py-2 border rounded hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center font-semibold text-lg">
                {format(referenceDate, 'MMM yyyy')}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setReferenceDate(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() + 7))}
                  className="px-3 py-2 border rounded hover:bg-gray-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={resetToToday}
                  className="px-3 py-2 border rounded hover:bg-gray-100 text-sm"
                >
                  Today
                </button>
              </div>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-medium text-gray-500">
                <div className="text-center w-8">Mon</div>
                <div className="text-center w-8">Tue</div>
                <div className="text-center w-8">Wed</div>
                <div className="text-center w-8">Thu</div>
                <div className="text-center w-8">Fri</div>
                <div className="text-center w-8">Sat</div>
                <div className="text-center w-8">Sun</div>
              </div>
              {renderCalendar().map(week => (
                <div key={week.weekNumber} className="grid grid-cols-7 gap-2 mb-2">
                  {week.days.map((day, index) => {
                    if (!day.date) {
                      return (
                        <div key={`empty-${week.weekNumber}-${index}`} className="h-32 w-full p-1 border border-transparent"></div>
                      );
                    }
                    
                     const dateKey = format(day.date, 'yyyy-MM-dd');
                     
                     const dateNum = day.date.getDate();
                     const isToday = isSameDay(day.date, new Date());
                     
                     return (
                       <div key={dateKey} className={`relative h-32 w-full p-1 border border-gray-100 hover:bg-gray-50 cursor-pointer ${isToday ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 dark:ring-blue-400' : ''}`} onClick={() => day.date && handleDayClick(day.date)}>
                         <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>{day.date ? day.date.getDate() : ''}</div>
                        <div className="flex flex-col gap-1 overflow-y-auto max-h-24 pr-1">
                          {day.events.slice(0, 3).map((event: Event) => (
                            <CalendarEventChip
                              key={event.id}
                              event={event}
                              onClick={() => setSelectedEvent(event)}
                              colorClass={getColor(event.city)}
                              showCity={false}
                            />
                          ))}
                          {day.events.length > 3 && (
                            <div className="text-xs text-gray-500 text-center">+{day.events.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
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
