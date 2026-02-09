'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format, isValid } from 'date-fns';
import { CalendarEventChip } from '@/components/calendar/calendar-event-chip';
import { EventDetailsModal } from '@/components/calendar/event-details-modal';

interface Event {
  id: number;
  run_id: number | null;
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

interface Run {
  id: number;
  agent: string;
}

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

interface FilterState {
  run_id: number | null;
  location: string;
  city: string;
  category: string;
  source: string;
  dateRange: DateRange;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    run_id: null,
    location: '',
    city: '',
    category: '',
    source: '',
    dateRange: { from: undefined },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const runsRes = await fetch('/api/runs');
        const runsData = await runsRes.json();
        setRuns(runsData);
        
        const eventsRes = await fetch('/api/events');
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
        console.log('Fetched events:', eventsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(events.map(e => e.location).filter((l): l is string => Boolean(l)))).sort();
  }, [events]);

  const uniqueCities = useMemo(() => {
    return Array.from(new Set(events.map(e => e.city).filter((c): c is string => Boolean(c)))).sort();
  }, [events]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(events.map(e => e.category).filter((c): c is string => Boolean(c)))).sort();
  }, [events]);

  const uniqueSources = useMemo(() => {
    return Array.from(new Set(events.map(e => e.source).filter((s): s is string => Boolean(s)))).sort();
  }, [events]);

  const categoryColors: Record<string, string> = {
    'Sonstige': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    'Musik': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    'Sport': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
    'Kultur': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    'default': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100',
  };

  const getCategoryColor = (category: string | null): string => {
    return category && categoryColors[category]
      ? categoryColors[category]
      : categoryColors['default'];
  };

  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    
    events.forEach(event => {
      if (!event.start_datetime) return;
      
      const startDate = new Date(event.start_datetime);
      
      // Handle multi-day events: add to ALL dates in range
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
        // Single day event
        const dateKey = format(startDate, 'yyyy-MM-dd');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(event);
      }
    });
    
    return grouped;
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter(event => {
        if (filters.run_id !== null && event.run_id !== filters.run_id) return false;
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
        const dateA = a.start_datetime ? new Date(a.start_datetime) : new Date(0);
        const dateB = b.start_datetime ? new Date(b.start_datetime) : new Date(0);
        return dateA.getTime() - dateB.getTime();
      });
  }, [events, filters]);

  const clearAllFilters = () => {
    setFilters({
      run_id: null,
      location: '',
      city: '',
      category: '',
      source: '',
      dateRange: { from: undefined },
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => {
    if (typeof v === 'object' && v !== null && 'from' in v) {
      return (v as { from: Date | undefined; to: Date | undefined }).from !== undefined || 
             (v as { from: Date | undefined; to: Date | undefined }).to !== undefined;
    }
    return v !== '' && v !== null && (typeof v !== 'number' || v !== 0);
  });

  // Handle date filter auto-navigation
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  // Custom day cell component
  const DayCell = (props: any) => {
    let dateKey = '';
    if (props.day) {
      try {
        // Try to create a valid Date object
        const dateObj = props.day instanceof Date ? props.day : new Date(props.day);
        if (!isNaN(dateObj.getTime())) {
          dateKey = format(dateObj, 'yyyy-MM-dd');
        }
      } catch (error) {
        console.error('Error formatting day:', props.day, error);
      }
    }
    
    const dayEvents = (dateKey && eventsByDate[dateKey] || []).filter(e => filteredEvents.includes(e));
    
    return (
      <div {...props} className="relative h-32 w-full p-1">
        <div className="text-sm font-medium mb-1">{props.day}</div>
        <div className="flex flex-col gap-1 overflow-hidden">
          {dayEvents.slice(0, 3).map(event => (
            <CalendarEventChip
              key={event.id}
              event={event}
              onClick={() => setSelectedEvent(event)}
              colorClass={getCategoryColor(event.category)}
              showCity={true}
            />
          ))}
          
          {/* More events indicator */}
          {dayEvents.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

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
            <span>{filteredEvents.length} events</span>
          </div>
        </div>

        {/* Filters Section */}
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Run ID</label>
              <Select value={filters.run_id?.toString() || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, run_id: v === 'all' ? null : Number(v) }))}>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select value={filters.location || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, location: v === 'all' ? '' : v }))}>
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
              <Select value={filters.city || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, city: v === 'all' ? '' : v }))}>
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
              <Select value={filters.category || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, category: v === 'all' ? '' : v }))}>
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
              <Select value={filters.source || 'all'} onValueChange={(v) => setFilters(prev => ({ ...prev, source: v === 'all' ? '' : v }))}>
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

        {/* Calendar */}
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
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Calendar</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      ←
                    </button>
                    <span className="text-sm font-medium">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                      className="px-3 py-1 border rounded hover:bg-gray-100"
                    >
                      →
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-medium text-gray-500">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>
                
                {Array.from({ length: 35 }, (_, i) => {
                  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                  const startingDayOfWeek = firstDayOfMonth.getDay();
                  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                  
                  const days = [];
                  
                  for (let i = 0; i < startingDayOfWeek; i++) {
                    days.push(null);
                  }
                  
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dayEvents = (eventsByDate[dateKey] || []).filter(e => filteredEvents.includes(e));
                    
                    days.push(
                      <div key={`${format(date, 'yyyy-MM-dd')}-${i}`} className="relative h-32 w-full p-1 border border-gray-100">
                        <div className="text-sm font-medium mb-1">{day}</div>
                        <div className="flex flex-col gap-1 overflow-hidden">
                          {dayEvents.slice(0, 3).map(event => (
                            <CalendarEventChip
                              key={event.id}
                              event={event}
                              onClick={() => setSelectedEvent(event)}
                              colorClass={getCategoryColor(event.category)}
                              showCity={true}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  const totalSlots = startingDayOfWeek + daysInMonth;
                  const remainingSlots = 42 - totalSlots;
                  
                  for (let i = 0; i < remainingSlots; i++) {
                    days.push(null);
                  }
                  
                  return days;
                }).flat()}
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        <EventDetailsModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      </div>
    </div>
  );
}
