import { AreaChart, BarChart, DonutChart, LineChart, StackedBarChart, type ChartProps } from '../charts';
import { ReportSection } from './ReportSection';
export function ReportChart({title,kind='bar',...props}:ChartProps&{title:string;kind?:'bar'|'line'|'area'|'donut'|'stacked'}){const Chart={bar:BarChart,line:LineChart,area:AreaChart,donut:DonutChart,stacked:StackedBarChart}[kind];return <ReportSection title={title}><Chart {...props}/></ReportSection>;}
