'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLocations } from '@/hooks/use-locations';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const LocationsMap = dynamic(() => import('@/components/locations/locations-map'), { ssr: false });

const CATEGORY_COLORS: Record<string, string> = {
  playground: '#f97316',
  park: '#22c55e',
  garden: '#10b981',
  museum: '#8b5cf6',
  pool: '#3b82f6',
  sport: '#ef4444',
  indoor_playground: '#f59e0b',
};

export default function LocationsPage() {
  const { locations, isLoading } = useLocations();
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    locations.forEach((l) => { counts[l.category] = (counts[l.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [locations]);

  const filteredLocations = useMemo(() => {
    if (activeCategories.size === 0) return locations;
    return locations.filter((l) => activeCategories.has(l.category));
  }, [locations, activeCategories]);

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
            {filteredLocations.length} Locations
          </h1>
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(([cat, count]) => {
              const isActive = activeCategories.size === 0 || activeCategories.has(cat);
              const color = CATEGORY_COLORS[cat] ?? '#6b7280';
              return (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white shadow-sm border border-gray-200 text-gray-800'
                      : 'bg-gray-100 text-gray-400 border border-transparent'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: isActive ? color : '#d1d5db' }}
                  />
                  <span className="capitalize">{cat.replace('_', ' ')}</span>
                  <span className="text-gray-400 text-xs">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner message="Loading locations..." />
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm" style={{ height: 'calc(100vh - 250px)' }}>
            <LocationsMap locations={filteredLocations} />
          </div>
        )}
      </div>
    </div>
  );
}
