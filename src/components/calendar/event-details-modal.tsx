'use client';

import { useState, useEffect, memo } from 'react';
import { ExternalLink, MapPin, Building2, Calendar, Clock, Tag, Star, Plus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Event } from '@/types';
import { formatEventDateTime } from '@/lib/event-utils';
import { useSession } from 'next-auth/react';

interface EventDetailsModalProps {
  event: Event | null;
  onClose: () => void;
  onRatingChange?: (eventId: number, userRating: number | null, avgRating: number | null, ratingCount: number) => void;
}

function EventDetailsModalComponent({ event, onClose, onRatingChange }: EventDetailsModalProps) {
  const { data: session } = useSession();
  const { dateRange, timeRange } = formatEventDateTime(event?.start_datetime || null, event?.end_datetime || null);
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false);
  const [addToCalendarSuccess, setAddToCalendarSuccess] = useState(false);
  const [addToCalendarError, setAddToCalendarError] = useState<string | null>(null);
  const [localRating, setLocalRating] = useState<number | null>(event?.user_rating ?? null);
  const [isRating, setIsRating] = useState(false);

  // Sync local rating when event changes
  useEffect(() => {
    setLocalRating(event?.user_rating ?? null);
  }, [event?.id, event?.user_rating]);

  const addToGoogleCalendar = async () => {
    if (!event) return;
    if (!session?.accessToken) {
      console.log('[Google Calendar] No access token in session', { hasSession: !!session, sessionKeys: session ? Object.keys(session) : [] });
      setAddToCalendarError('Please sign in to add events to your calendar');
      return;
    }

    if (!event.start_datetime) {
      setAddToCalendarError('Cannot add event without a start time');
      return;
    }

    setIsAddingToCalendar(true);
    setAddToCalendarError(null);
    console.log('[Google Calendar] Adding event', { eventName: event.name, hasAccessToken: !!session.accessToken });

    try {
      const locationParts = [];
      if (event.location) locationParts.push(event.location);
      if (event.city) locationParts.push(event.city);
      const locationString = locationParts.join(', ');

      const descriptionParts = [];
      if (event.description) descriptionParts.push(event.description);
      if (event.location) descriptionParts.push(`📍 ${event.location}`);
      if (event.city) descriptionParts.push(`🏙️ ${event.city}`);
      if (event.category) descriptionParts.push(`🏷️ ${event.category}`);
      if (event.source) descriptionParts.push(`🔗 ${event.source}`);
      const descriptionString = descriptionParts.join('\n\n');

      const eventData = {
        summary: event.name,
        description: descriptionString,
        location: locationString,
        start: {
          dateTime: new Date(event.start_datetime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end_datetime
            ? new Date(event.end_datetime).toISOString()
            : new Date(new Date(event.start_datetime).getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      console.log('[Google Calendar] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[Google Calendar] API error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to add event to calendar');
      }

      const responseData = await response.json();
      console.log('[Google Calendar] Event added successfully:', responseData.id);

      setAddToCalendarSuccess(true);
      setTimeout(() => setAddToCalendarSuccess(false), 2000);
    } catch (error) {
      setAddToCalendarError(error instanceof Error ? error.message : 'Failed to add event to calendar');
    } finally {
      setIsAddingToCalendar(false);
    }
  };

  const handleRate = async (newRating: number | null) => {
    if (!event) return;
    const prevRating = localRating;
    setLocalRating(newRating);
    setIsRating(true);
    try {
      const res = await fetch(`/api/events/${event.id}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: newRating }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      onRatingChange?.(event.id, data.user_rating, data.avg_rating, data.rating_count);
    } catch {
      setLocalRating(prevRating);
    } finally {
      setIsRating(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.name}</DialogTitle>
          {event.description && (
            <DialogDescription>
              {event.description}
            </DialogDescription>
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

          <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 shrink-0 text-gray-600 dark:text-gray-400" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Your Rating:</span>
              <StarRating rating={localRating} onRate={handleRate} isLoading={isRating} />
            </div>
            {event.avg_rating !== null && event.rating_count > 0 && (
              <div className="flex items-center gap-1.5 pl-6 text-sm text-gray-500 dark:text-gray-400">
                <span>Avg: {event.avg_rating}</span>
                <span className="text-xs">({event.rating_count} {event.rating_count === 1 ? 'rating' : 'ratings'})</span>
              </div>
            )}
          </div>
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

        <div className="mt-4 flex flex-col gap-2">
          {addToCalendarError && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{addToCalendarError}</span>
            </div>
          )}

          {addToCalendarSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>Added to Google Calendar!</span>
            </div>
          )}

          <button
            onClick={addToGoogleCalendar}
            disabled={isAddingToCalendar}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {isAddingToCalendar ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Adding...</span>
              </>
            ) : addToCalendarSuccess ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Add to Google Calendar</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add to Google Calendar</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const EventDetailsModal = memo(EventDetailsModalComponent);
