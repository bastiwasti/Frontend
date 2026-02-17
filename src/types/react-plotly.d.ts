declare module 'react-plotly.js' {
  import { PlotData, Layout, Config } from 'plotly.js';
  import { Component } from 'react';

  export interface PlotProps {
    data: Partial<PlotData>[];
    layout?: Partial<Layout>;
    config?: Partial<Config>;
    style?: React.CSSProperties;
    onInitialized?: () => void;
    onUpdate?: () => void;
    useResizeHandler?: boolean;
    className?: string;
  }

  export default class Plot extends Component<PlotProps> {}
}
