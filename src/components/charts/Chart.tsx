import { useSyncExternalStore, useMemo, lazy, Suspense } from 'react';
const ReactApexChart=lazy(()=>import('react-apexcharts'));
import type { ApexOptions } from 'apexcharts';
import { chartColors, subscribeTheme, darkTheme } from './theme';
import { fromCentavos } from '../../utils/pos';
export interface ChartSeries { name:string; data:number[]; type?:'line'|'column'; count?:boolean }
export interface ChartProps { labels:string[]; series:ChartSeries[]; summary:string; loading?:boolean; height?:number; horizontal?:boolean; count?:boolean }
export function Chart({labels,series,summary,loading=false,height=280,horizontal=false,count=false,type='line',stacked=false}:ChartProps & {type?:'line'|'bar'|'area'|'donut';stacked?:boolean}){
 const dark=useSyncExternalStore(subscribeTheme,darkTheme,()=>false);
 const options=useMemo<ApexOptions>(()=>({chart:{background:'transparent',foreColor:dark?'#cbd5e1':'#64748b',toolbar:{show:false},stacked,animations:{enabled:false},redrawOnParentResize:true,redrawOnWindowResize:true,fontFamily:'inherit'},theme:{mode:dark?'dark':'light'},colors:chartColors,labels,xaxis:{categories:labels,labels:{hideOverlappingLabels:true,rotate:-30}},yaxis:series.some(s=>s.count)&&series.some(s=>!s.count)?series.map(s=>({seriesName:s.name,opposite:!!s.count,labels:{formatter:(v:number)=>Number.isFinite(v)?v.toLocaleString('en-PH',{maximumFractionDigits:s.count?0:2}):''}})):{labels:{formatter:(v:number)=>Number.isFinite(v)?v.toLocaleString('en-PH',{maximumFractionDigits:count?0:2}):''}},grid:{borderColor:dark?'#334155':'#e2e8f0',strokeDashArray:4},dataLabels:{enabled:false},stroke:{width:type==='bar'?2:3,curve:'smooth'},plotOptions:{bar:{horizontal,borderRadius:3,columnWidth:'55%'},pie:{donut:{size:'68%'}}},legend:{position:'bottom'},tooltip:{theme:dark?'dark':'light'},noData:{text:'No data for this period'},responsive:[{breakpoint:640,options:{legend:{position:'bottom'},chart:{height:250}}}]}),[dark,labels,series,stacked,type,horizontal,count]);
 if(loading)return <div role="status" aria-label="Loading chart" className="animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" style={{height}}/>;
 if(!series.some(s=>s.data.some(v=>v!==0)))return <div role="status" className="flex items-center justify-center text-sm text-slate-500" style={{height}}>No data for this period</div>;
 const scaled=series.map(s=>({...s,data:s.data.map(v=>count||s.count?v:fromCentavos(v))}));
 return <figure role="img" aria-label={summary} className="min-w-0"><figcaption className="sr-only">{summary}</figcaption><Suspense fallback={<div role="status" aria-label="Loading chart" className="animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" style={{height}}/>}><ReactApexChart type={type} height={height} width="100%" options={options} series={type==='donut'?scaled[0]?.data:scaled}/></Suspense></figure>;
}
