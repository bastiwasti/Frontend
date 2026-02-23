'use client';

import { useState, useEffect } from 'react';
import type { Event, Run } from '@/types';

export function useEventsAndRuns(): {
  events: Event[];
  runs: Run[];
  isLoading: boolean;
  error: string | null;
} {
  const [events, setEvents] = useState<Event[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [eventsRes, runsRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/runs'),
        ]);
        const [eventsData, runsData] = await Promise.all([
          eventsRes.json(),
          runsRes.json(),
        ]);
        setEvents(eventsData);
        setRuns(runsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return { events, runs, isLoading, error };
}
