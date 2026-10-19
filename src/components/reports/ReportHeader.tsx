import { T } from "../../i18n/T";
import {Download,Printer} from 'lucide-react';
import {formatDateTime as displayDateTime} from '../../utils/date';
import type {ReportFilter} from '../../types/accounts';
import {DateRangePicker} from './DateRangePicker';
import {BranchFilter} from './BranchFilter';
export function ComparisonToggle({value,onChange}:{value:boolean;onChange:(v:boolean)=>void}){return <label className="flex items-center gap-2 text-xs"><input role="switch" type="checkbox" checked={value} onChange={e=>onChange(e.target.checked)}/><T text={"Compare to previous period"}/></label>;}
export function PrintHeader({title,filter}:{title:string;filter:ReportFilter}){return <header className="print-header"><h1>TindaPOS · {title}</h1><p>{filter.branchId==='all'?'All branches':filter.branchId} · {filter.from} – {filter.to}</p><p>Generated {displayDateTime(new Date())}</p></header>;}
export function ReportHeader({title,filter,onChange,onExport}:{title:string;filter:ReportFilter;onChange:(f:ReportFilter)=>void;onExport?:()=>void}){
 return <><div className="report-controls panel reference-report-filters"><DateRangePicker value={filter} onChange={r=>onChange({...filter,...r})}/><BranchFilter value={filter.branchId} onChange={branchId=>onChange({...filter,branchId})}/><ComparisonToggle value={filter.compare} onChange={compare=>onChange({...filter,compare})}/><div className="ml-auto flex gap-2">{onExport&&<button className="btn" onClick={onExport}><Download size={15}/><T text={"Export CSV"}/></button>}<button className="btn" onClick={()=>window.print()}><Printer size={15}/><T text={"Print / PDF"}/></button></div></div><PrintHeader title={`${title} report`} filter={filter}/></>;
}
