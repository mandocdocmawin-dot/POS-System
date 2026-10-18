import { Chart, type ChartProps } from './Chart';
export type { ChartProps, ChartSeries } from './Chart';
export const LineChart=(props:ChartProps)=><Chart {...props} type="line"/>;
export const BarChart=(props:ChartProps)=><Chart {...props} type="bar"/>;
export const AreaChart=(props:ChartProps)=><Chart {...props} type="area"/>;
export const DonutChart=(props:ChartProps)=><Chart {...props} type="donut"/>;
export const StackedBarChart=(props:ChartProps)=><Chart {...props} type="bar" stacked/>;
