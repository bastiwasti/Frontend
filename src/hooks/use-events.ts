'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Event } from '@/types';

export function useEvents(): {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  updateEventRating: (eventId: number, userRating: number | null, avgRating: number | null, ratingCount: number) => void;
} {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setEvents(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const updateEventRating = useCallback(
    (eventId: number, userRating: number | null, avgRating: number | null, ratingCount: number) => {
      setEvents(prev =>
        prev.map(e =>
          e.id === eventId
            ? { ...e, user_rating: userRating, avg_rating: avgRating, rating_count: ratingCount }
            : e
        )
      );
    },
    []
  );

  return { events, isLoading, error, updateEventRating };
}
