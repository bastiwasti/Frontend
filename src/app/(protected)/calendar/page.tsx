'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter, ExternalLink, CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, isSameDay, isValid } from 'date-fns';

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
  const [expandedEventIds, setExpandedEventIds] = useState<Set<number>>(new Set());

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
        console.log('Fetched events:', eventsData);
        setEvents(eventsData);
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

  const filteredEvents = useMemo(() => {
    const filtered = events
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
    
    console.log('Filtered events count:', filtered.length);
    return filtered;
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

  const toggleDescriptionExpand = (eventId: number) => {
    setExpandedEventIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  const formatEventDateTime = (startDatetime: string | null, endDatetime: string | null) => {
    if (!startDatetime) return { dateRange: null, timeRange: null };

    const start = new Date(startDatetime);
    const end = endDatetime ? new Date(endDatetime) : null;

    if (!isValid(start)) return { dateRange: null, timeRange: null };

    const formatDate = (date: Date) => format(date, 'MMM d, yyyy');
    const formatTime = (date: Date) => format(date, 'h:mm a');

    let dateRange: string;
    let timeRange: string;

    if (end && isValid(end)) {
      if (isSameDay(start, end)) {
        dateRange = formatDate(start);
        timeRange = `${formatTime(start)} - ${formatTime(end)}`;
      } else {
        dateRange = `${formatDate(start)} - ${formatDate(end)}`;
        timeRange = `${formatTime(start)} - ${formatTime(end)}`;
      }
    } else {
      dateRange = formatDate(start);
      timeRange = formatTime(start);
    }

    return { dateRange, timeRange };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Events Gallery</h1>
            <p className="text-gray-600 dark:text-gray-400">Browse and filter through discovered events</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Filter className="w-4 h-4" />
            <span>{filteredEvents.length} events</span>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
                  <X className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
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
                <label className="text-sm font-medium">Date Range</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, 'MMM d, yyyy')} - {format(filters.dateRange.to, 'MMM d, yyyy')}
                          </>
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
                        onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range || { from: undefined } }))}
                        numberOfMonths={2}
                      />
                  </PopoverContent>
                </Popover>
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
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Filter className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No events found</h3>
              <p className="text-gray-500 text-center">Try adjusting your filters or clear all filters to see all events.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((event) => {
              const { dateRange, timeRange } = formatEventDateTime(event.start_datetime, event.end_datetime);
              const isExpanded = expandedEventIds.has(event.id);
              
              return (
                <Card key={event.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{event.name}</CardTitle>
                    {event.description && (
                      <div className="space-y-1">
                        <CardDescription className={isExpanded ? '' : 'line-clamp-3'}>{event.description}</CardDescription>
                        <button
                          onClick={() => toggleDescriptionExpand(event.id)}
                          className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              Show less
                              <ChevronUp className="h-3 w-3" />
                            </>
                          ) : (
                            <>
                              Show more
                              <ChevronDown className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                          <span className="text-gray-600 dark:text-gray-400">{event.location}</span>
                        </div>
                      )}
                      {event.city && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">City:</span>
                          <span className="text-gray-600 dark:text-gray-400">{event.city}</span>
                        </div>
                      )}
                      {dateRange && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                          <span className="text-gray-600 dark:text-gray-400">{dateRange}</span>
                        </div>
                      )}
                      {timeRange && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Time:</span>
                          <span className="text-gray-600 dark:text-gray-400">{timeRange}</span>
                        </div>
                      )}
                      {event.category && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-xs capitalize">
                            {event.category}
                          </span>
                        </div>
                      )}
                    </div>
                    {event.source && (
                      <a
                        href={event.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        View Source
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
