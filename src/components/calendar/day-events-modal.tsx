'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarEventChip } from './calendar-event-chip';
import type { Event } from '@/types';

interface DayEventsModalProps {
  date: Date | null;
  events: Event[];
  onClose: () => void;
  onEventClick: (event: Event) => void;
}

export function DayEventsModal({ date, events, onClose, onEventClick }: DayEventsModalProps) {

  if (!events || events.length === 0) return null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[80vw] max-w-[80vw] h-[80vh] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">
              Events for {date ? formatDate(date) : 'Selected Day'}
            </DialogTitle>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-3">
          {events.map((event: Event) => (
            <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => onEventClick(event)}>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {event.name}
                    </span>
                    {event.category && (
                      <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm capitalize">
                        {event.category}
                      </span>
                    )}
                  </div>
                  {event.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                {event.location && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                    <span>{event.location}</span>
                  </div>
                )}
                {event.city && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">City:</span>
                    <span>{event.city}</span>
                  </div>
                )}
                {event.start_datetime && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                    <span>
                      {new Date(event.start_datetime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
