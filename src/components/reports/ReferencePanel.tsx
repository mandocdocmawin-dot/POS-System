import type {ReactNode} from 'react';
import type {LucideIcon} from 'lucide-react';
import {MoreVertical} from 'lucide-react';
import {payrollMoney} from '../../utils/money';
import {DeltaBadge} from './ReportSection';
export function ReferenceMetrics({items,compact=false,bars=false}:{items:{label:string;value:number;count?:boolean;detail?:string;previous?:number;icon?:LucideIcon;progress?:number}[];compact?:boolean;bars?:boolean}){
 return <div className={`reference-metrics ${compact?'compact':''}`} style={{'--metric-columns':items.length} as React.CSSProperties}>{items.map((m,i)=>{const Icon=m.icon;return <section className="panel reference-metric" key={m.label}>{Icon&&<span className={`reference-metric-icon metric-tone-${i}`}><Icon size={20}/></span>}<div className="reference-metric-content"><p>{m.label}</p><strong>{m.count?m.value.toLocaleString():payrollMoney(m.value)}</strong>{m.previous!==undefined&&<DeltaBadge value={m.value} previous={m.previous}/>}<small>{m.detail}</small>{bars&&<div className="reference-progress"><span style={{width:`${Math.max(0,Math.min(100,m.progress??0))}%`}}/></div>}</div></section>;})}</div>;
}
export function ReferencePanel({title,control,children,className=''}:{title:string;control?:ReactNode;children:ReactNode;className?:string}){
 return <section className={`panel reference-panel ${className}`}><header><h2>{title}</h2>{control??<MoreVertical size={16} className="commerce-muted"/>}</header><div className="reference-panel-body">{children}</div></section>;
}
