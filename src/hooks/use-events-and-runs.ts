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
          fetch('/api/events?source=raw'),
          fetch('/api/runs'),
        ]);

        if (!eventsRes.ok) {
          const errorData = await eventsRes.json().catch(() => ({}));
          throw new Error(`Events API error: ${errorData.error || `HTTP ${eventsRes.status}`}`);
        }
        if (!runsRes.ok) {
          const errorData = await runsRes.json().catch(() => ({}));
          throw new Error(`Runs API error: ${errorData.error || `HTTP ${runsRes.status}`}`);
        }

        const [eventsData, runsData] = await Promise.all([
          eventsRes.json(),
          runsRes.json(),
        ]);

        if (!Array.isArray(eventsData)) {
          throw new Error('Events API returned non-array data');
        }
        if (!Array.isArray(runsData)) {
          throw new Error('Runs API returned non-array data');
        }

        setEvents(eventsData);
        setRuns(runsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        setEvents([]);
        setRuns([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return { events, runs, isLoading, error };
}
