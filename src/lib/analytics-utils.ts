import type { Event, Run, Dimension, DimensionOption, MetricOption, ChartTypeOption } from '@/types';

export function getDimensionValue(item: Event | Run, dim: Dimension): string {
  const isEvent = 'category' in item;
  const date = isEvent
    ? ((item as Event).start_datetime || item.created_at)
    : item.created_at;
  const d = date ? new Date(date) : new Date();

  switch (dim) {
    case 'category':
      return isEvent ? ((item as Event).category || 'Unknown') : 'Unknown';
    case 'city':
      return isEvent
        ? ((item as Event).city || 'Unknown')
        : ((item as Run).cities || 'Unknown');
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
}

export const dimensionOptions: DimensionOption[] = [
  { value: 'category', label: 'Category', description: 'Event category' },
  { value: 'city', label: 'City', description: 'Event city' },
  { value: 'source', label: 'Source', description: 'Event source' },
  { value: 'location', label: 'Location', description: 'Event location' },
  { value: 'agent', label: 'Agent', description: 'Run agent' },
  { value: 'month', label: 'Month', description: 'Month of year' },
  { value: 'year', label: 'Year', description: 'Year' },
  { value: 'day_of_week', label: 'Day of Week', description: 'Day of week' },
];

export const metricOptions: MetricOption[] = [
  { value: 'count', label: 'Count', description: 'Number of events' },
  { value: 'avg_duration', label: 'Avg Duration', description: 'Average run duration (seconds)' },
  { value: 'sum_duration', label: 'Sum Duration', description: 'Total run duration (seconds)' },
  { value: 'events_found', label: 'Events Found', description: 'Total events found per run' },
  { value: 'valid_events', label: 'Valid Events', description: 'Valid events per run' },
];

export const chartTypeOptions: ChartTypeOption[] = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'scatter', label: 'Scatter Plot' },
];
