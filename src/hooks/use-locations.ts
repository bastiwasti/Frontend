'use client';

import { useState, useEffect } from 'react';
import type { Location } from '@/types';

export function useLocations(): { locations: Location[]; isLoading: boolean; error: string | null } {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/locations');
        const data = await res.json();
        setLocations(data);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return { locations, isLoading, error };
}
