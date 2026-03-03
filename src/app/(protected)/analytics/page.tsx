'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { isValid } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { KpiCards } from '@/components/analytics/kpi-cards';
import { DataSourceFilter } from '@/components/analytics/data-source-filter';
import { ChartControls } from '@/components/analytics/chart-controls';
import { AnalyticsChart } from '@/components/analytics/analytics-chart';
import { useEventsAndRuns } from '@/hooks/use-events-and-runs';
import { useAnalyticsData } from '@/hooks/use-analytics-data';
import type { Dimension, Metric, ChartType, DateRange } from '@/types';

export default function AnalyticsPage() {
  const { events, runs, isLoading } = useEventsAndRuns();
  const [chartError, setChartError] = useState<string | null>(null);

  const [dataSource, setDataSource] = useState<'all' | 'run'>('all');
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined });

  const [dimension, setDimension] = useState<Dimension>('category');
  const [groupBy, setGroupBy] = useState<Dimension | null>(null);
  const [metric, setMetric] = useState<Metric>('count');
  const [chartType, setChartType] = useState<ChartType>('bar');

  useEffect(() => {
    let errorTimeout: NodeJS.Timeout;
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // Defer state update to avoid cascading renders
      errorTimeout = setTimeout(() => {
        setChartError(event.error?.message || 'Unknown error');
      }, 0);
    };
    window.addEventListener('error', handleError);
    return () => {
      window.removeEventListener('error', handleError);
      clearTimeout(errorTimeout);
    };
  }, []);

  useEffect(() => {
    if (groupBy === dimension) {
      // Defer state update to avoid cascading renders
      const timeoutId = setTimeout(() => {
        setGroupBy(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [dimension, groupBy]);

  const handleGroupByChange = useCallback((value: string) => {
    setGroupBy(value === '__none__' ? null : (value as Dimension));
  }, []);

  const filteredEvents = useMemo(() => {
    let filtered = dataSource === 'all' ? events : events.filter(e => e.run_id === selectedRunId);
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(event => {
        const startDate = event.start_datetime ? new Date(event.start_datetime) : null;
        if (!startDate || !isValid(startDate)) return false;
        if (dateRange.from && startDate < dateRange.from) return false;
        if (dateRange.to && startDate > dateRange.to) return false;
        return true;
      });
    }
    return filtered;
  }, [events, dataSource, selectedRunId, dateRange]);

  const { chartData, layout } = useAnalyticsData({
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
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">Analytics</h1>
          <LoadingSpinner message="Loading analytics..." />
        </div>
      </div>
    );
  }

  if (chartError) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">Analytics</h1>
          <div className="text-center py-12">
            <p className="text-destructive mb-4 font-medium">Error: {chartError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">Analytics</h1>

        <KpiCards events={filteredEvents} />

        <DataSourceFilter
          dataSource={dataSource}
          onDataSourceChange={setDataSource}
          selectedRunId={selectedRunId}
          onRunIdChange={setSelectedRunId}
          runs={runs}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />

        <Card>
          <CardHeader>
            <CardTitle>Custom Analysis</CardTitle>
            <CardDescription>Select dimensions and metrics to analyze your data</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartControls
              dimension={dimension}
              groupBy={groupBy}
              metric={metric}
              chartType={chartType}
              onDimensionChange={setDimension}
              onGroupByChange={handleGroupByChange}
              onMetricChange={setMetric}
              onChartTypeChange={setChartType}
            />
            <AnalyticsChart
              chartData={chartData}
              layout={layout}
              hasData={filteredEvents.length > 0}
              chartError={chartError}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
