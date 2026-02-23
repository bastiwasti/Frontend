'use client';

import { useState, useEffect } from 'react';
import type { Run } from '@/types';

export function useRuns(): { runs: Run[]; isLoading: boolean } {
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/runs');
        const data = await res.json();
        setRuns(data);
      } catch (err) {
        console.error('Error fetching runs:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return { runs, isLoading };
}
