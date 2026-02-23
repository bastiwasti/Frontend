'use client';

import { useState, useEffect, useMemo } from 'react';
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
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setChartError(event.error?.message || 'Unknown error');
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    if (groupBy === dimension) setGroupBy(null);
  }, [dimension, groupBy]);

  const handleGroupByChange = (value: string) => {
    setGroupBy(value === '__none__' ? null : (value as Dimension));
  };

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
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Analytics</h1>
          <LoadingSpinner message="Loading analytics..." />
        </div>
      </div>
    );
  }

  if (chartError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Analytics</h1>
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error: {chartError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Analytics</h1>

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
