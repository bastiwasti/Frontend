'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildColorMap } from '@/lib/color-utils';
import { cn } from '@/lib/utils';
import { StarRating } from '@/components/ui/star-rating';
import type { Event } from '@/types';

interface DayEventsModalProps {
  date: Date | null;
  events: Event[];
  onClose: () => void;
  onEventClick: (event: Event) => void;
  getDistanceKm: (city: string | null) => number | null;
  homeCity: string;
}

export function DayEventsModal({ date, events, onClose, onEventClick, getDistanceKm, homeCity }: DayEventsModalProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());
  const prevDateKey = useRef<string | null>(null);

  // Reset accordion only when a genuinely different day is opened
  useEffect(() => {
    const key = date ? date.toDateString() : null;
    if (key !== prevDateKey.current) {
      prevDateKey.current = key;
      if (key) setOpenCategories(new Set());
    }
  }, [date]);

  const categories = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach(event => {
      const cat = event.category || 'Uncategorized';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(event);
    });
    // Sort largest category first
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [events]);

  const highlightEvents = useMemo(() => {
    // Only include events with valid ratings
    const ratedEvents = events.filter(event => event.avg_rating !== null && event.avg_rating > 0);
    
    // If no rated events, return empty
    if (ratedEvents.length === 0) return [];
    
    // Find the maximum rating for this day
    const maxRating = Math.max(...ratedEvents.map(e => e.avg_rating!));
    
    // Only include events with the maximum rating
    const highlights = ratedEvents.filter(event => event.avg_rating === maxRating);
    
    // Sort by rating (desc), then distance (asc), then start time (asc)
    const sorted = highlights.sort((a, b) => {
      const ratingA = a.avg_rating ?? 0;
      const ratingB = b.avg_rating ?? 0;
      if (ratingA !== ratingB) return ratingB - ratingA;
      const dA = getDistanceKm(a.city ?? null) ?? Infinity;
      const dB = getDistanceKm(b.city ?? null) ?? Infinity;
      if (dA !== dB) return dA - dB;
      return (a.start_datetime ?? '').localeCompare(b.start_datetime ?? '');
    });
    
    // Return only top 5
    return sorted.slice(0, 5);
  }, [events, getDistanceKm]);

  const colorMap = useMemo(
    () => buildColorMap(categories.map(([name]) => name)),
    [categories]
  );

  const toggle = (cat: string) => {
    setOpenCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  if (!events || events.length === 0) return null;

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex flex-col gap-4 h-[85vh] max-h-[85vh] w-[90vw] max-w-[90vw] sm:w-[80vw] sm:max-w-[80vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Events for {date ? formatDate(date) : 'Selected Day'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-2">
          {/* Highlights Section */}
          {highlightEvents.length > 0 && (
            <div className="rounded-lg overflow-hidden border-2 border-yellow-300 dark:border-yellow-600 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20">
              <div className="px-4 py-3 bg-yellow-100 dark:bg-yellow-900/40 border-b border-yellow-200 dark:border-yellow-700">
                <div className="flex items-center gap-3">
                  <span className="text-lg">⭐</span>
                  <span className="font-semibold text-yellow-900 dark:text-yellow-100">Highlights</span>
                  <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                    {highlightEvents.length} event{highlightEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="divide-y divide-yellow-100 dark:divide-yellow-800/50">
                {highlightEvents.map((event) => {
                  const distKm = getDistanceKm(event.city ?? null);
                  return (
                    <div
                      key={event.id}
                      className="px-4 py-3 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/30 transition-colors cursor-pointer"
                      onClick={() => onEventClick(event)}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {event.name}
                        </span>
                        {event.user_rating ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">You:</span>
                            <StarRating rating={event.user_rating} size="sm" />
                          </div>
                        ) : event.avg_rating !== null && event.rating_count > 0 ? (
                          <div className="flex items-center gap-1">
                            <StarRating rating={event.avg_rating} size="sm" />
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{event.avg_rating}</span>
                            <span className="text-xs text-gray-400">({event.rating_count})</span>
                          </div>
                        ) : null}
                      </div>
                      {event.description && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {event.location && (
                          <span>
                            <span className="font-medium text-gray-600 dark:text-gray-300">Location:</span> {event.location}
                          </span>
                        )}
                        {event.city && (
                          <span>
                            <span className="font-medium text-gray-600 dark:text-gray-300">City:</span> {event.city}
                            {distKm !== null && (
                              <span className="ml-1 opacity-60">({Math.round(distKm)} km)</span>
                            )}
                          </span>
                        )}
                        {event.start_datetime && (
                          <span>
                            <span className="font-medium text-gray-600 dark:text-gray-300">Time:</span>{' '}
                            {new Date(event.start_datetime).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {categories.map(([catName, catEvents]) => {
            const isOpen = openCategories.has(catName);
            const color = colorMap[catName] ?? '';

            // Sort events by distance from home city, then by rating (desc), then by start time
            const sortedEvents = [...catEvents].sort((a, b) => {
              const dA = getDistanceKm(a.city ?? null) ?? Infinity;
              const dB = getDistanceKm(b.city ?? null) ?? Infinity;
              if (dA !== dB) return dA - dB;
              const ratingA = a.avg_rating ?? 0;
              const ratingB = b.avg_rating ?? 0;
              if (ratingA !== ratingB) return ratingB - ratingA;
              return (a.start_datetime ?? '').localeCompare(b.start_datetime ?? '');
            });

            return (
              <div key={catName} className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700">
                {/* Category header */}
                <button
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 transition-all hover:brightness-95',
                    color
                  )}
                  onClick={() => toggle(catName)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold capitalize">{catName}</span>
                    <span className="text-xs font-medium opacity-70">
                      {catEvents.length} event{catEvents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* Event list */}
                {isOpen && (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {sortedEvents.map((event) => {
                      const distKm = getDistanceKm(event.city ?? null);
                      return (
                        <div
                          key={event.id}
                          className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                          onClick={() => onEventClick(event)}
                        >
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {event.name}
                            </span>
                            {event.user_rating ? (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">You:</span>
                                <StarRating rating={event.user_rating} size="sm" />
                              </div>
                            ) : event.avg_rating !== null && event.rating_count > 0 ? (
                              <div className="flex items-center gap-1">
                                <StarRating rating={event.avg_rating} size="sm" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{event.avg_rating}</span>
                                <span className="text-xs text-gray-400">({event.rating_count})</span>
                              </div>
                            ) : null}
                          </div>
                          {event.description && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-1">
                              {event.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                            {event.location && (
                              <span>
                                <span className="font-medium text-gray-600 dark:text-gray-300">Location:</span> {event.location}
                              </span>
                            )}
                            {event.city && (
                              <span>
                                <span className="font-medium text-gray-600 dark:text-gray-300">City:</span> {event.city}
                                {distKm !== null && (
                                  <span className="ml-1 opacity-60">({Math.round(distKm)} km)</span>
                                )}
                              </span>
                            )}
                            {event.start_datetime && (
                              <span>
                                <span className="font-medium text-gray-600 dark:text-gray-300">Time:</span>{' '}
                                {new Date(event.start_datetime).toLocaleTimeString('en-US', {
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
