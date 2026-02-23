'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { Event } from '@/types';
import { formatEventDateTime } from '@/lib/event-utils';

interface EventCardProps {
  event: Event;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function EventCard({ event, isExpanded, onToggleExpand }: EventCardProps) {
  const { dateRange, timeRange } = formatEventDateTime(event.start_datetime, event.end_datetime);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="line-clamp-2 text-lg">{event.name}</CardTitle>
        {event.description && (
          <div className="space-y-1">
            <CardDescription className={isExpanded ? '' : 'line-clamp-3'}>
              {event.description}
            </CardDescription>
            <button
              onClick={onToggleExpand}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              {isExpanded ? (
                <>Show less<ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Show more<ChevronDown className="h-3 w-3" /></>
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
}
