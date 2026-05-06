'use client';

import { useState, useEffect, useCallback } from 'react';

type UserRatingRow = { event_id: number; rating: number };

export function useUserRatings(): {
  ratings: Map<number, number>;
  isLoading: boolean;
  setRating: (eventId: number, rating: number | null) => void;
} {
  const [ratings, setRatings] = useState<Map<number, number>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const res = await fetch('/api/user-ratings');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: UserRatingRow[] = await res.json();
        if (cancelled) return;
        setRatings(new Map(data.map(r => [r.event_id, r.rating])));
      } catch (err) {
        console.error('Error fetching user ratings:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const setRating = useCallback((eventId: number, rating: number | null) => {
    setRatings(prev => {
      const next = new Map(prev);
      if (rating === null) next.delete(eventId);
      else next.set(eventId, rating);
      return next;
    });
  }, []);

  return { ratings, isLoading, setRating };
}
