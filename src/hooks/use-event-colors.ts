'use client';

import { useState, useMemo, useCallback } from 'react';
import { COLOR_PALETTE, buildColorMap } from '@/lib/color-utils';

export function useEventColors(uniqueCities: string[], uniqueCategories: string[]) {
  const [colorMode, setColorMode] = useState<'city' | 'category'>('city');

  const cityColors = useMemo(() => buildColorMap(uniqueCities), [uniqueCities]);
  const categoryColors = useMemo(() => buildColorMap(uniqueCategories), [uniqueCategories]);

  const getColor = useCallback(
    (value: string | null): string => {
      if (!value) return COLOR_PALETTE[0];
      return colorMode === 'city'
        ? (cityColors[value] ?? COLOR_PALETTE[0])
        : (categoryColors[value] ?? COLOR_PALETTE[0]);
    },
    [colorMode, cityColors, categoryColors]
  );

  return { colorMode, setColorMode, cityColors, categoryColors, getColor };
}
