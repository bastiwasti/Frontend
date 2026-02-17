'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false, loading: () => <div className="h-96 flex items-center justify-center">Loading chart...</div> });

interface Event {
  id: number;
  run_id: number | null;
  name: string;
  description: string | null;
  location: string | null;
  city: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  category: string | null;
  source: string | null;
  created_at: string;
}

interface Run {
  id: number;
  agent: string;
  cities: string | null;
  created_at: string;
  duration: number | null;
  events_found: number | null;
  valid_events: number | null;
}

type Dimension = 'category' | 'city' | 'source' | 'location' | 'agent' | 'month' | 'year' | 'day_of_week';
type Metric = 'count' | 'avg_duration' | 'sum_duration' | 'events_found' | 'valid_events';
type ChartType = 'bar' | 'line' | 'scatter';

interface DimensionOption {
  value: Dimension;
  label: string;
  description: string;
}

interface MetricOption {
  value: Metric;
  label: string;
  description: string;
}

interface ChartTypeOption {
  value: ChartType;
  label: string;
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  const [dataSource, setDataSource] = useState<'all' | 'run'>('all');
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);

  const [dimension, setDimension] = useState<Dimension>('category');
  const [groupBy, setGroupBy] = useState<Dimension | null>(null);
  const [metric, setMetric] = useState<Metric>('count');
  const [chartType, setChartType] = useState<ChartType>('bar');

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [eventsRes, runsRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/runs')
        ]);
        const eventsData = await eventsRes.json();
        const runsData = await runsRes.json();
        setEvents(eventsData);
        setRuns(runsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (groupBy === dimension) {
      setGroupBy(null);
    }
  }, [dimension, groupBy]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      setChartError(event.error?.message || 'Unknown error');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const dimensionOptions: DimensionOption[] = [
    { value: 'category', label: 'Category', description: 'Event category' },
    { value: 'city', label: 'City', description: 'Event city' },
    { value: 'source', label: 'Source', description: 'Event source' },
    { value: 'location', label: 'Location', description: 'Event location' },
    { value: 'agent', label: 'Agent', description: 'Run agent' },
    { value: 'month', label: 'Month', description: 'Month of year' },
    { value: 'year', label: 'Year', description: 'Year' },
    { value: 'day_of_week', label: 'Day of Week', description: 'Day of week' },
  ];

  const metricOptions: MetricOption[] = [
    { value: 'count', label: 'Count', description: 'Number of events' },
    { value: 'avg_duration', label: 'Avg Duration', description: 'Average run duration (seconds)' },
    { value: 'sum_duration', label: 'Sum Duration', description: 'Total run duration (seconds)' },
    { value: 'events_found', label: 'Events Found', description: 'Total events found per run' },
    { value: 'valid_events', label: 'Valid Events', description: 'Valid events per run' },
  ];

  const chartTypeOptions: ChartTypeOption[] = [
    { value: 'bar', label: 'Bar Chart' },
    { value: 'line', label: 'Line Chart' },
    { value: 'scatter', label: 'Scatter Plot' },
  ];

  const filteredEvents = useMemo(() => {
    if (dataSource === 'all' || !selectedRunId) {
      return events || [];
    }
    return (events || []).filter(event => event.run_id === selectedRunId);
  }, [events, dataSource, selectedRunId]);

  const chartData = useMemo(() => {
    try {
      if (isLoading) return { x: [], y: [], text: [], type: chartType };

      const getDimensionValue = (item: Event | Run, dim: Dimension): string => {
        const isEvent = 'category' in item;
        const date = isEvent ? (item as Event).start_datetime || item.created_at : item.created_at;
        const d = date ? new Date(date) : new Date();

        switch (dim) {
          case 'category':
            return isEvent ? ((item as Event).category || 'Unknown') : 'Unknown';
          case 'city':
            return isEvent ? ((item as Event).city || 'Unknown') : ((item as Run).cities || 'Unknown');
          case 'source':
            return isEvent ? ((item as Event).source || 'Unknown') : 'Unknown';
          case 'location':
            return isEvent ? ((item as Event).location || 'Unknown') : 'Unknown';
          case 'agent':
            return isEvent ? 'Unknown' : (item as Run).agent;
          case 'month':
            return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          case 'year':
            return d.getFullYear().toString();
          case 'day_of_week':
            return d.toLocaleDateString('en-US', { weekday: 'long' });
          default:
            return 'Unknown';
        }
      };

      const itemsToProcess = metric === 'count' ? filteredEvents : (runs || []);

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
            aggregated[value].duration.push(item.duration);
          }
          if ('events_found' in item && item.events_found !== null) {
            aggregated[value].events_found.push(item.events_found);
          }
          if ('valid_events' in item && item.valid_events !== null) {
            aggregated[value].valid_events.push(item.valid_events);
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

      const sortedIndices = values
        .map((_, i) => i)
        .sort((a, b) => values[b] - values[a]);

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

          if (!groupedData[dimValue]) {
            groupedData[dimValue] = {};
          }
          if (!groupedData[dimValue][groupValue]) {
            groupedData[dimValue][groupValue] = { count: 0, duration: [], events_found: [], valid_events: [] };
          }

          groupedData[dimValue][groupValue].count++;

          if ('duration' in item && item.duration !== null) {
            groupedData[dimValue][groupValue].duration.push(item.duration);
          }
          if ('events_found' in item && item.events_found !== null) {
            groupedData[dimValue][groupValue].events_found.push(item.events_found);
          }
          if ('valid_events' in item && item.valid_events !== null) {
            groupedData[dimValue][groupValue].valid_events.push(item.valid_events);
          }

          groupTotals[groupValue] = (groupTotals[groupValue] || 0) + 1;
        } catch (error) {
          console.error('Error processing item:', error, item);
        }
      });

      const sortedGroups = Object.keys(groupTotals)
        .sort((a, b) => groupTotals[b] - groupTotals[a])
        .slice(0, 3);

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

        return {
          x: dimLabels,
          y: values,
          name: groupValue,
          type: chartType,
        };
      });

      return traces;
    }
    } catch (error) {
      console.error('Error computing chart data:', error);
      return { x: [], y: [], text: [], type: chartType };
    }
  }, [dimension, groupBy, metric, chartType, filteredEvents, runs, isLoading]);

  const layout = {
    title: `${metricOptions.find(m => m.value === metric)?.label} by ${dimensionOptions.find(d => d.value === dimension)?.label}${groupBy ? ` (Grouped by ${dimensionOptions.find(d => d.value === groupBy)?.label})` : ''}${dataSource === 'run' && selectedRunId ? ` (Run ${selectedRunId})` : ''}`,
    xaxis: { title: dimensionOptions.find(d => d.value === dimension)?.label },
    yaxis: { title: metricOptions.find(m => m.value === metric)?.label },
    margin: { l: 80, r: 20, t: 60, b: 100 },
    height: 500,
    responsive: true,
    barmode: groupBy ? 'group' : undefined,
    hovermode: groupBy ? 'x unified' : 'closest',
  };

  const kpiCards = useMemo(() => {
    const eventsToUse = filteredEvents || [];
    const totalEvents = eventsToUse.length;
    const uniqueCategories = new Set(eventsToUse.map(e => e.category)).size;
    const uniqueCities = new Set(eventsToUse.map(e => e.city)).size;
    const uniqueSources = new Set(eventsToUse.map(e => e.source)).size;

    return [
      { label: 'Total Events', value: totalEvents },
      { label: 'Categories', value: uniqueCategories },
      { label: 'Cities', value: uniqueCities },
      { label: 'Sources', value: uniqueSources },
    ];
  }, [filteredEvents]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Analytics</h1>
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
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
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardDescription>{card.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-3xl">{card.value}</CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data Source Filter</CardTitle>
            <CardDescription>Select which data to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant={dataSource === 'all' ? 'default' : 'outline'}
                  onClick={() => setDataSource('all')}
                  className={dataSource === 'all' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                >
                  ALL EVENTS
                </Button>
                <span className="text-gray-400">or</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={dataSource === 'run' ? 'default' : 'outline'}
                    onClick={() => setDataSource('run')}
                    className={dataSource === 'run' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    Select Run ID
                  </Button>
                  {dataSource === 'run' && (
                    <Select
                      value={selectedRunId?.toString() || ''}
                      onValueChange={(v) => setSelectedRunId(v ? parseInt(v) : null)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Choose run" />
                      </SelectTrigger>
                      <SelectContent>
                        {runs.map(run => (
                          <SelectItem key={run.id} value={run.id.toString()}>
                            Run {run.id} - {run.agent}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Analysis</CardTitle>
            <CardDescription>Select dimensions and metrics to analyze your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dimension (X-axis)</label>
                <Select value={dimension} onValueChange={(v: Dimension) => setDimension(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dimensionOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Group By (Color)</label>
                <Select value={groupBy || ''} onValueChange={(v) => setGroupBy(v as Dimension | null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {dimensionOptions
                      .filter(opt => opt.value !== dimension)
                      .map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Metric (Y-axis)</label>
                <Select value={metric} onValueChange={(v: Metric) => setMetric(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {metricOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Chart Type</label>
                <Select value={chartType} onValueChange={(v: ChartType) => setChartType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(!filteredEvents || filteredEvents.length === 0) ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500">
                No data available for the selected filters
              </div>
            ) : chartError ? (
              <div className="flex items-center justify-center h-[500px] text-red-500">
                Error loading chart: {chartError}
              </div>
            ) : (
              <Plot
                data={Array.isArray(chartData) ? chartData as any : [chartData as any]}
                layout={layout as any}
                config={{ responsive: true, displayModeBar: true }}
                style={{ width: '100%', height: '500px' }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
