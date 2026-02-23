'use client';

import { useMemo } from 'react';
import { format } from 'date-fns';
import type { Event, Run, Dimension, Metric, ChartType, DateRange } from '@/types';
import { getDimensionValue, dimensionOptions, metricOptions } from '@/lib/analytics-utils';

interface AnalyticsDataParams {
  filteredEvents: Event[];
  runs: Run[];
  dimension: Dimension;
  groupBy: Dimension | null;
  metric: Metric;
  chartType: ChartType;
  isLoading: boolean;
  dataSource: 'all' | 'run';
  selectedRunId: number | null;
  dateRange: DateRange;
}

export function useAnalyticsData({
  filteredEvents,
  runs,
  dimension,
  groupBy,
  metric,
  chartType,
  isLoading,
  dataSource,
  selectedRunId,
  dateRange,
}: AnalyticsDataParams) {
  const chartData = useMemo(() => {
    try {
      if (isLoading) return { x: [], y: [], text: [], type: chartType };

      const itemsToProcess: (Event | Run)[] = metric === 'count' ? filteredEvents : (runs || []);

      if (!itemsToProcess || itemsToProcess.length === 0) {
        return { x: [], y: [], text: [], type: chartType };
      }

      if (!groupBy) {
        const aggregated: Record<string, { count: number; duration: number[]; events_found: number[]; valid_events: number[] }> = {};

        itemsToProcess.forEach(item => {
          try {
            const value = getDimensionValue(item, dimension);
            if (!aggregated[value]) {
              aggregated[value] = { count: 0, duration: [], events_found: [], valid_events: [] };
            }
            aggregated[value].count++;

            if ('duration' in item && item.duration !== null) {
              aggregated[value].duration.push(item.duration as number);
            }
            if ('events_found' in item && item.events_found !== null) {
              aggregated[value].events_found.push(item.events_found as number);
            }
            if ('valid_events' in item && item.valid_events !== null) {
              aggregated[value].valid_events.push(item.valid_events as number);
            }
          } catch (error) {
            console.error('Error processing item:', error, item);
          }
        });

        const labels = Object.keys(aggregated);
        const values = labels.map(label => {
          const data = aggregated[label];
          switch (metric) {
            case 'count':
              return data.count;
            case 'avg_duration':
              return data.duration.length > 0 ? data.duration.reduce((a, b) => a + b, 0) / data.duration.length : 0;
            case 'sum_duration':
              return data.duration.reduce((a, b) => a + b, 0);
            case 'events_found':
              return data.events_found.reduce((a, b) => a + b, 0);
            case 'valid_events':
              return data.valid_events.reduce((a, b) => a + b, 0);
            default:
              return 0;
          }
        });

        const sortedIndices = values.map((_, i) => i).sort((a, b) => values[b] - values[a]);
        const sortedLabels = sortedIndices.map(i => labels[i]);
        const sortedValues = sortedIndices.map(i => values[i]);

        return {
          x: sortedLabels,
          y: sortedValues,
          text: sortedValues.map(v => v.toFixed(2)),
          type: chartType,
          marker: {
            color: sortedValues,
            colorscale: 'Viridis',
          },
        };
      } else {
        const groupedData: Record<string, Record<string, { count: number; duration: number[]; events_found: number[]; valid_events: number[] }>> = {};
        const groupTotals: Record<string, number> = {};

        itemsToProcess.forEach(item => {
          try {
            const dimValue = getDimensionValue(item, dimension);
            const groupValue = getDimensionValue(item, groupBy);

            if (!groupedData[dimValue]) groupedData[dimValue] = {};
            if (!groupedData[dimValue][groupValue]) {
              groupedData[dimValue][groupValue] = { count: 0, duration: [], events_found: [], valid_events: [] };
            }

            groupedData[dimValue][groupValue].count++;

            if ('duration' in item && item.duration !== null) {
              groupedData[dimValue][groupValue].duration.push(item.duration as number);
            }
            if ('events_found' in item && item.events_found !== null) {
              groupedData[dimValue][groupValue].events_found.push(item.events_found as number);
            }
            if ('valid_events' in item && item.valid_events !== null) {
              groupedData[dimValue][groupValue].valid_events.push(item.valid_events as number);
            }

            groupTotals[groupValue] = (groupTotals[groupValue] || 0) + 1;
          } catch (error) {
            console.error('Error processing item:', error, item);
          }
        });

        const sortedGroups = Object.keys(groupTotals).sort((a, b) => groupTotals[b] - groupTotals[a]);
        const dimLabels = Object.keys(groupedData).sort();

        const traces = sortedGroups.map(groupValue => {
          const values = dimLabels.map(dimLabel => {
            const data = groupedData[dimLabel]?.[groupValue];
            if (!data) return 0;

            switch (metric) {
              case 'count':
                return data.count;
              case 'avg_duration':
                return data.duration.length > 0 ? data.duration.reduce((a, b) => a + b, 0) / data.duration.length : 0;
              case 'sum_duration':
                return data.duration.reduce((a, b) => a + b, 0);
              case 'events_found':
                return data.events_found.reduce((a, b) => a + b, 0);
              case 'valid_events':
                return data.valid_events.reduce((a, b) => a + b, 0);
              default:
                return 0;
            }
          });

          return { x: dimLabels, y: values, name: groupValue, type: chartType };
        });

        return traces;
      }
    } catch (error) {
      console.error('Error computing chart data:', error);
      return { x: [], y: [], text: [], type: chartType };
    }
  }, [dimension, groupBy, metric, chartType, filteredEvents, runs, isLoading]);

  const layout = {
    title: (() => {
      let title = `${metricOptions.find(m => m.value === metric)?.label} by ${dimensionOptions.find(d => d.value === dimension)?.label}`;
      if (groupBy) {
        title += ` (Grouped by ${dimensionOptions.find(d => d.value === groupBy)?.label})`;
      }
      if (dataSource === 'run' && selectedRunId) {
        title += ` (Run ${selectedRunId})`;
      }
      if (dateRange.from || dateRange.to) {
        const dateStr = dateRange.from ? format(dateRange.from, 'MMM d, yyyy') : '';
        const dateStrEnd = dateRange.to ? ` - ${format(dateRange.to, 'MMM d, yyyy')}` : '';
        title += ` (${dateStr}${dateStrEnd})`;
      }
      return title;
    })(),
    xaxis: { title: dimensionOptions.find(d => d.value === dimension)?.label },
    yaxis: { title: metricOptions.find(m => m.value === metric)?.label },
    margin: { l: 80, r: 20, t: 60, b: 100 },
    height: 500,
    responsive: true,
    barmode: groupBy ? 'group' : undefined,
    hovermode: groupBy ? 'x unified' : 'closest',
  };

  return { chartData, layout };
}
