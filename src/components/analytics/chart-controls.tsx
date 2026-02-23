'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Dimension, Metric, ChartType } from '@/types';
import { dimensionOptions, metricOptions, chartTypeOptions } from '@/lib/analytics-utils';

interface ChartControlsProps {
  dimension: Dimension;
  groupBy: Dimension | null;
  metric: Metric;
  chartType: ChartType;
  onDimensionChange: (value: Dimension) => void;
  onGroupByChange: (value: string) => void;
  onMetricChange: (value: Metric) => void;
  onChartTypeChange: (value: ChartType) => void;
}

export function ChartControls({
  dimension,
  groupBy,
  metric,
  chartType,
  onDimensionChange,
  onGroupByChange,
  onMetricChange,
  onChartTypeChange,
}: ChartControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Dimension (X-axis)</label>
        <Select value={dimension} onValueChange={(v: Dimension) => onDimensionChange(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {dimensionOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Group By (Color)</label>
        <Select value={groupBy || '__none__'} onValueChange={onGroupByChange}>
          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {dimensionOptions
              .filter(opt => opt.value !== dimension)
              .map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Metric (Y-axis)</label>
        <Select value={metric} onValueChange={(v: Metric) => onMetricChange(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {metricOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Chart Type</label>
        <Select value={chartType} onValueChange={(v: ChartType) => onChartTypeChange(v)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {chartTypeOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
