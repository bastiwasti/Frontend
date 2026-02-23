'use client';

import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center">Loading chart...</div>,
});

interface AnalyticsChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chartData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  layout: any;
  hasData: boolean;
  chartError: string | null;
}

export function AnalyticsChart({ chartData, layout, hasData, chartError }: AnalyticsChartProps) {
  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[500px] text-gray-500">
        No data available for the selected filters
      </div>
    );
  }

  if (chartError) {
    return (
      <div className="flex items-center justify-center h-[500px] text-red-500">
        Error loading chart: {chartError}
      </div>
    );
  }

  return (
    <Plot
      data={Array.isArray(chartData) ? chartData : [chartData]}
      layout={layout}
      config={{ responsive: true, displayModeBar: true }}
      style={{ width: '100%', height: '500px' }}
    />
  );
}
