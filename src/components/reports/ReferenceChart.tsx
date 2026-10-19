import { T } from "../../i18n/T";
import {lazy,Suspense,useMemo,useSyncExternalStore} from 'react';
import type {ApexOptions} from 'apexcharts';
import {darkTheme,subscribeTheme,chartColors} from '../charts/theme';
import {fromCentavos} from '../../utils/pos';
import type {ChartSeries} from '../charts';
const ApexChart=lazy(()=>import('react-apexcharts'));
const referencePalette=[chartColors[0],'#334e78',chartColors[1],chartColors[4]];
type Kind='comparison'|'weekly'|'grouped'|'distribution'|'semicircle'|'sparkline';

/** Report-specific compositions; amounts are supplied in centavos. */
export function ReferenceChart({kind,labels,series,summary,height=320,count=false}:{kind:Kind;labels:string[];series:ChartSeries[];summary:string;height?:number;count?:boolean}){
 const dark=useSyncExternalStore(subscribeTheme,darkTheme,()=>false);
 const donut=kind==='semicircle',spark=kind==='sparkline',bar=['weekly','grouped','distribution'].includes(kind);
 const options=useMemo<ApexOptions>(()=>({
  chart:{background:'transparent',foreColor:dark?'#cbd5e1':'#64748b',fontFamily:'inherit',toolbar:{show:false},animations:{enabled:false},stacked:kind==='distribution',sparkline:{enabled:spark},redrawOnParentResize:true},
  theme:{mode:dark?'dark':'light'},colors:kind==='weekly'?['#334e78']:referencePalette,labels,
  xaxis:{categories:labels,position:kind==='weekly'?'top':'bottom',axisBorder:{show:false},axisTicks:{show:!bar},labels:{rotate:0,hideOverlappingLabels:true,style:{fontSize:'11px'}}},
  yaxis:{show:kind!=='weekly',labels:{formatter:v=>Number.isFinite(v)?v.toLocaleString('en-PH',{maximumFractionDigits:count?0:1}):'',style:{fontSize:'11px'}}},
  grid:{show:!spark,borderColor:dark?'#334155':'#eceef2',strokeDashArray:kind==='comparison'?4:0,padding:{left:8,right:12,top:kind==='weekly'?5:12,bottom:0}},
  stroke:{width:bar?0:2,curve:kind==='comparison'?'straight':'smooth',dashArray:kind==='comparison'?[0,5]:0},
  fill:{type:kind==='comparison'?'gradient':'solid',opacity:1,gradient:{shadeIntensity:0,opacityFrom:.35,opacityTo:.02,stops:[0,100]}},
  markers:{size:0},dataLabels:{enabled:kind==='weekly'||kind==='distribution',offsetY:kind==='weekly'?-12:0,style:{fontSize:'10px',fontWeight:600,colors:kind==='weekly'?[dark?'#e2e8f0':'#334e78']:['#fff']},background:{enabled:false},formatter:v=>Number(v).toLocaleString('en-PH',{maximumFractionDigits:1})},
  plotOptions:{bar:{horizontal:kind==='distribution',borderRadius:kind==='weekly'?4:0,columnWidth:kind==='grouped'?'42%':'52%',barHeight:'45%',dataLabels:{position:kind==='weekly'?'top':'center'}},pie:{startAngle:donut?-90:0,endAngle:donut?90:360,offsetY:donut?24:0,donut:{size:'76%',labels:{show:false}},expandOnClick:false}},
  legend:{show:!spark&&!donut&&kind!=='weekly',position:donut?'right':'bottom',horizontalAlign:'center',fontSize:'11px',markers:{shape:'square'}},
  tooltip:{theme:dark?'dark':'light'},noData:{text:'No data for this period'},
 }),[dark,kind,labels,count,donut,spark,bar]);
 const scaled=series.map((s,i)=>({...s,...(kind==='comparison'?{type:i?'line':'area'}:{}),data:s.data.map(v=>count||s.count?v:fromCentavos(v))}));
 const type=donut?'donut':bar?'bar':kind==='comparison'?'area':'line';
 const hasData=series.some(s=>s.data.some(v=>v!==0));
 return <figure className="reference-chart" aria-label={summary} role="img"><figcaption className="sr-only">{summary}</figcaption>{!hasData?<div className="commerce-empty" style={{height}}><T text={"No data for this period"}/></div>:<Suspense fallback={<div className="animate-pulse bg-slate-50 dark:bg-slate-800" role="status" aria-label="Loading chart" style={{height}}/>}><ApexChart type={type} height={height} width="100%" options={options} series={donut?scaled[0]?.data:scaled}/></Suspense>}</figure>;
}
