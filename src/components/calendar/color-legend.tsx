'use client';

import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { COLOR_PALETTE } from '@/lib/color-utils';

interface ColorLegendProps {
  colorMode: 'city' | 'category';
  onToggleColorMode: () => void;
  uniqueCities: string[];
  uniqueCategories: string[];
  cityColors: Record<string, string>;
  categoryColors: Record<string, string>;
}

export function ColorLegend({
  colorMode,
  onToggleColorMode,
  uniqueCities,
  uniqueCategories,
  cityColors,
  categoryColors,
}: ColorLegendProps) {
  const items = colorMode === 'city'
    ? uniqueCities.map(v => ({ label: v, color: cityColors[v] ?? COLOR_PALETTE[0] }))
    : uniqueCategories.map(v => ({ label: v, color: categoryColors[v] ?? COLOR_PALETTE[0] }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4 mb-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium capitalize">
          {colorMode === 'city' ? 'Categories' : 'Cities'}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleColorMode}
          className="flex items-center gap-2"
        >
          <Palette className="w-4 h-4" />
          <span className="text-xs">
            {colorMode === 'city' ? 'Change Color Categories' : 'Change Color Cities'}
          </span>
        </Button>
      </div>
      <div className="flex flex-wrap gap-3">
        {items.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
