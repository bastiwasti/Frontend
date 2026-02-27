'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { buildColorMap } from '@/lib/color-utils';
import { cn } from '@/lib/utils';
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

  // Reset accordion whenever a new day is opened
  useEffect(() => {
    setOpenCategories(new Set());
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
          {categories.map(([catName, catEvents]) => {
            const isOpen = openCategories.has(catName);
            const color = colorMap[catName] ?? '';

            // Sort events by distance from home city, then by start time
            const sortedEvents = [...catEvents].sort((a, b) => {
              const dA = getDistanceKm(a.city ?? null) ?? Infinity;
              const dB = getDistanceKm(b.city ?? null) ?? Infinity;
              if (dA !== dB) return dA - dB;
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
                          <div className="mb-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {event.name}
                            </span>
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
