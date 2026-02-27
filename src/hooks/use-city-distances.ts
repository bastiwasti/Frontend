'use client';

import { useState, useEffect, useCallback } from 'react';

export function useCityDistances(cities: string[], homeCity: string) {
  const [distances, setDistances] = useState<Record<string, number | null>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Stable key to avoid unnecessary re-fetches
  const citiesKey = [...cities].sort().join(',');

  useEffect(() => {
    if (!homeCity || !cities.length) return;

    setIsLoading(true);
    const query = cities.map(c => encodeURIComponent(c)).join(',');
    fetch(`/api/city-road-distances?home=${encodeURIComponent(homeCity)}&cities=${query}`)
      .then(r => r.json())
      .then((data: Record<string, number | null>) => {
        setDistances(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [citiesKey, homeCity]);

  const getDistanceKm = useCallback(
    (city: string | null): number | null => (!city ? null : distances[city] ?? null),
    [distances]
  );

  return { getDistanceKm, isLoading };
}
