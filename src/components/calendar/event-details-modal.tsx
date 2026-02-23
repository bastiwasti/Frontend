'use client';

import { useState, memo } from 'react';
import { ExternalLink, MapPin, Building2, Calendar, Clock, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Event } from '@/types';
import { formatEventDateTime } from '@/lib/event-utils';

interface EventDetailsModalProps {
  event: Event | null;
  onClose: () => void;
}

function EventDetailsModalComponent({ event, onClose }: EventDetailsModalProps) {
  const { dateRange, timeRange } = formatEventDateTime(event?.start_datetime || null, event?.end_datetime || null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  if (!event) return null;

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={isDescriptionExpanded ? 'max-w-lg' : 'max-w-md'}>
        <DialogHeader>
          <DialogTitle className="text-xl">{event.name}</DialogTitle>
          {event.description && (
            <div className="space-y-1">
              <DialogDescription
                className={isDescriptionExpanded ? '' : 'line-clamp-3'}
              >
                {event.description}
              </DialogDescription>
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                {isDescriptionExpanded ? (
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

export const EventDetailsModal = memo(EventDetailsModalComponent);
