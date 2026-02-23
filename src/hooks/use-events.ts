'use client';

import { useState, useEffect } from 'react';
import type { Event } from '@/types';

export function useEvents(): { events: Event[]; isLoading: boolean; error: string | null } {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return { events, isLoading, error };
}
