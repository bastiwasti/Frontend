'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserRatings } from '@/hooks/use-user-ratings';
import type { Event } from '@/types';

export function useEvents(): {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  updateEventRating: (eventId: number, userRating: number | null, avgRating: number | null, ratingCount: number) => void;
} {
  const [baseEvents, setBaseEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { ratings: userRatings, setRating } = useUserRatings();

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/events');

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error('API returned non-array data');
        }

        setBaseEvents(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setBaseEvents([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const events = useMemo<Event[]>(
    () => baseEvents.map(e => ({ ...e, user_rating: userRatings.get(e.id) ?? null })),
    [baseEvents, userRatings]
  );

  const updateEventRating = useCallback(
    (eventId: number, userRating: number | null, avgRating: number | null, ratingCount: number) => {
      setBaseEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? { ...e, avg_rating: avgRating, rating_count: ratingCount }
            : e
        )
      );
      setRating(eventId, userRating);
    },
    [setRating]
  );

  return { events, isLoading, error, updateEventRating };
}
