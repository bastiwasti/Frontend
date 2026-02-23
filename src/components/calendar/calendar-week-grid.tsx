'use client';

import { useMemo, useCallback } from 'react';
import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarEventChip } from '@/components/calendar/calendar-event-chip';
import { formatDateLocal } from '@/lib/event-utils';
import type { Event } from '@/types';

interface CalendarDay {
  date: Date | null;
  dateKey: string;
  events: Event[];
}

interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

interface CalendarWeekGridProps {
  referenceDate: Date;
  eventsByDate: Record<string, Event[]>;
  onNavigatePrev: () => void;
  onNavigateNext: () => void;
  onResetToToday: () => void;
  onDayClick: (date: Date) => void;
  onEventClick: (event: Event) => void;
  getColor: (value: string | null) => string;
}

export function CalendarWeekGrid({
  referenceDate,
  eventsByDate,
  onNavigatePrev,
  onNavigateNext,
  onResetToToday,
  onDayClick,
  onEventClick,
  getColor,
}: CalendarWeekGridProps) {
  const weeks = useMemo<CalendarWeek[]>(() => {
    const referenceDayOfWeek = referenceDate.getDay();
    const daysBack = referenceDayOfWeek === 0 ? 6 : referenceDayOfWeek - 1;

    const days: CalendarDay[] = [];

    for (let i = 0; i < 7; i++) {
      const year = referenceDate.getFullYear();
      const month = referenceDate.getMonth();
      const dayOfMonth = referenceDate.getDate() - daysBack + i;
      const currentDate = new Date(year, month, dayOfMonth, 0, 0, 0, 0);

      const dateKey = formatDateLocal(currentDate);
      const dayEvents = eventsByDate[dateKey] || [];

      days.push({ date: currentDate, dateKey, events: dayEvents });
    }

    return [{ days, weekNumber: 1 }];
  }, [referenceDate, eventsByDate]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
      <div className="flex items-center justify-between p-4 mb-4">
        <button
          onClick={onNavigatePrev}
          className="px-3 py-2 border rounded hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-center font-semibold text-lg">
          {format(referenceDate, 'MMM yyyy')}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateNext}
            className="px-3 py-2 border rounded hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={onResetToToday}
            className="px-3 py-2 border rounded hover:bg-gray-100 text-sm"
          >
            Today
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-medium text-gray-500">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
            <div key={d} className="text-center w-8">{d}</div>
          ))}
        </div>

        {weeks.map(week => (
          <div key={week.weekNumber} className="grid grid-cols-7 gap-2 mb-2">
            {week.days.map((day, index) => {
              if (!day.date) {
                return <div key={`empty-${week.weekNumber}-${index}`} className="h-32 w-full p-1 border border-transparent" />;
              }

              const dateKey = format(day.date, 'yyyy-MM-dd');
              const isToday = isSameDay(day.date, new Date());

              return (
                <div
                  key={dateKey}
                  className={`relative h-32 w-full p-1 border border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    isToday ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500 dark:ring-blue-400' : ''
                  }`}
                  onClick={() => day.date && onDayClick(day.date)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>
                    {day.date.getDate()}
                  </div>
                  <div className="flex flex-col gap-1 overflow-y-auto max-h-24 pr-1">
                    {day.events.slice(0, 3).map((event: Event) => (
                      <CalendarEventChip
                        key={event.id}
                        event={event}
                        onClick={() => onEventClick(event)}
                        colorClass={getColor(event.city)}
                        showCity={false}
                      />
                    ))}
                    {day.events.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
