'use client';

import { useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { formatDateLocal } from '@/lib/event-utils';
import type { Event } from '@/types';

function getDayAverageRating(events: Event[]): number | null {
  const ratedEvents = events.filter(e => e.avg_rating !== null);
  if (ratedEvents.length === 0) return null;
  const sum = ratedEvents.reduce((acc, e) => acc + e.avg_rating!, 0);
  return Math.round((sum / ratedEvents.length) * 10) / 10;
}

interface CalendarDay {
  date: Date;
  dateKey: string;
  events: Event[];
  isCurrentMonth: boolean;
}

interface CalendarMonthGridProps {
  referenceDate: Date;
  eventsByDate: Record<string, Event[]>;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onResetToToday: () => void;
  onDayClick: (date: Date) => void;
}

export function CalendarMonthGrid({
  referenceDate,
  eventsByDate,
  onNavigatePrev,
  onNavigateNext,
  onResetToToday,
  onDayClick,
}: CalendarMonthGridProps) {
  const days = useMemo<CalendarDay[]>(() => {
    const year = referenceDate.getFullYear();
    const month = referenceDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday-based: Mon=0 ... Sun=6
    const firstDayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon, ...
    const daysBeforeFirst = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const result: CalendarDay[] = [];

    // Trailing days from previous month
    for (let i = daysBeforeFirst - 1; i >= 0; i--) {
      const date = new Date(year, month, -i); // 0 = last of prev month, -1 = 2nd-to-last, etc.
      const dateKey = formatDateLocal(date);
      result.push({ date, dateKey, events: eventsByDate[dateKey] || [], isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month, d);
      const dateKey = formatDateLocal(date);
      result.push({ date, dateKey, events: eventsByDate[dateKey] || [], isCurrentMonth: true });
    }

    // Leading days from next month to fill last week
    const remainder = result.length % 7;
    if (remainder !== 0) {
      const toAdd = 7 - remainder;
      for (let i = 1; i <= toAdd; i++) {
        const date = new Date(year, month + 1, i);
        const dateKey = formatDateLocal(date);
        result.push({ date, dateKey, events: eventsByDate[dateKey] || [], isCurrentMonth: false });
      }
    }

    return result;
  }, [referenceDate, eventsByDate]);

  const today = new Date();

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <button
          onClick={onNavigatePrev}
          className="p-2 rounded border hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="font-semibold text-lg text-foreground">
          {format(referenceDate, 'MMMM yyyy')}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetToToday}
            className="px-3 py-1.5 text-sm border rounded hover:bg-accent transition-colors"
          >
            Today
          </button>
          <button
            onClick={onNavigateNext}
            className="p-2 rounded border hover:bg-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 border-b">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      
      {/* Day grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border">
        {days.map((day) => {
          const isToday = isSameDay(day.date, today);
          return (
            <div
              key={day.dateKey}
              onClick={() => onDayClick(day.date)}
              className={[
                'min-h-[5rem] p-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md',
                day.isCurrentMonth 
                  ? 'hover:bg-accent' 
                  : 'opacity-40',
                isToday && 'bg-primary/20 ring-2 ring-inset ring-primary',
              ].filter(Boolean).join(' ')}
            >
               <div className={[
                 'text-sm font-medium leading-none mb-1.5',
                 isToday
                   ? 'text-primary font-bold'
                   : day.isCurrentMonth
                     ? 'text-foreground'
                     : 'text-muted-foreground',
               ].join(' ')}>
                 {day.date.getDate()}
               </div>
                {day.events.length > 0 && (
                  <span className="inline-flex items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                    <span className="sm:hidden">{day.events.length}</span>
                    <span className="hidden sm:inline">{day.events.length} Event{day.events.length !== 1 ? 's' : ''}</span>
                  </span>
                )}
                {(() => {
                  const avgRating = getDayAverageRating(day.events);
                  if (avgRating === null) return null;
                  return (
                    <div className="flex items-center gap-1 mt-1.5 text-amber-500">
                      <Star className="h-3 w-3 fill-amber-500" />
                      <span className="text-xs font-medium">{avgRating}</span>
                    </div>
                  );
                })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
