'use client';

import { ExternalLink, MapPin, Building2, Calendar, Clock, Tag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
}

interface EventDetailsModalProps {
  event: Event | null;
  onClose: () => void;
}

export function EventDetailsModal({ event, onClose }: EventDetailsModalProps) {
  const { dateRange, timeRange } = formatEventDateTime(event?.start_datetime || null, event?.end_datetime || null);

  if (!event) return null;

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.name}</DialogTitle>
          {event.description && (
            <DialogDescription className="line-clamp-3">{event.description}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-3 text-sm">
          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-600 dark:text-gray-400" />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{event.location}</span>
              </div>
            </div>
          )}

          {event.city && (
            <div className="flex items-start gap-2">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-600 dark:text-gray-400" />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">City:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{event.city}</span>
              </div>
            </div>
          )}

          {dateRange && (
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-600 dark:text-gray-400" />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{dateRange}</span>
              </div>
            </div>
          )}

          {timeRange && (
            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gray-600 dark:text-gray-400" />
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Time:</span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">{timeRange}</span>
              </div>
            </div>
          )}

          {event.category && (
            <div className="flex items-start gap-2">
              <Tag className="mt-0.5 h-4 w-4 shrink-0 text-gray-600 dark:text-gray-400" />
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-xs capitalize">
                  {event.category}
                </span>
              </div>
            </div>
          )}
        </div>

        {event.source && (
          <a
            href={event.source}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            View Source
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </DialogContent>
    </Dialog>
  );
}

function formatEventDateTime(startDatetime: string | null, endDatetime: string | null) {
  if (!startDatetime) return { dateRange: null, timeRange: null };

  const start = new Date(startDatetime);
  const end = endDatetime ? new Date(endDatetime) : null;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  let dateRange: string;
  let timeRange: string;

  if (end) {
    const startDay = start.toDateString();
    const endDay = end.toDateString();

    if (startDay === endDay) {
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
}
