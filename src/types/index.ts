export interface Event {
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
  origin: string | null;
  created_at: string;
}

export interface Run {
  id: number;
  agent: string;
  cities: string | null;
  created_at: string;
  raw_summary_id: number | null;
  duration: number | null;
  events_found: number | null;
  valid_events: number | null;
  start_time: string | null;
  end_time: string | null;
}

export type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

export interface BaseFilterState {
  location: string[];
  city: string[];
  category: string[];
  source: string[];
  origin: string[];
  dateRange: DateRange;
}

export interface EventListFilterState extends BaseFilterState {
  run_id: number | null;
}

export type Dimension =
  | 'category'
  | 'city'
  | 'source'
  | 'location'
  | 'origin'
  | 'agent'
  | 'month'
  | 'year'
  | 'day_of_week';

export type Metric =
  | 'count'
  | 'avg_duration'
  | 'sum_duration'
  | 'events_found'
  | 'valid_events';

export type ChartType = 'bar' | 'line' | 'scatter';

export interface DimensionOption {
  value: Dimension;
  label: string;
  description: string;
}

export interface MetricOption {
  value: Metric;
  label: string;
  description: string;
}

export interface ChartTypeOption {
  value: ChartType;
  label: string;
}
