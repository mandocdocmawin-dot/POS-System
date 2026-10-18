import { useState, type ReactNode } from 'react';
import type { ReportFilter } from '../../types/accounts';
import { ReportHeader } from './ReportHeader';
import { ReportBoundary } from './ReportSection';
import { reportService } from '../../services/reportService';
import { exportCSV } from '../../utils/csv';
export function ReportFrame({title,filter,children,csv}:{title:string;filter:ReportFilter;children:ReactNode;csv?:(string|number)[][]}){const [error,setError]=useState('');return <ReportBoundary><article className="report-document space-y-5"><ReportHeader title={title} filter={filter} onChange={f=>{try{reportService.setFilters(f);setError('');}catch(e){setError(e instanceof Error?e.message:'Invalid filter.');}}} onExport={csv?()=>exportCSV(`${title.toLowerCase()}-${filter.from}-${filter.to}.csv`,csv):undefined}/>{error&&<p role="alert" className="text-sm text-red-500">{error}</p>}{children}</article></ReportBoundary>;}
