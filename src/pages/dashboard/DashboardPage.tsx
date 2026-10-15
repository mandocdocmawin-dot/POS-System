import { Store } from 'lucide-react'
import { PageHeader } from '../../components/layout/PageHeader'
import { useBranchStore } from '../../store/useBranchStore'
import { SummaryRow } from './SummaryRow'
export function Component() { const branch = useBranchStore(s => s.branch); return <><PageHeader title="Dashboard" breadcrumb={['Dashboards', 'Main']}/><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold tracking-tight">Good morning, Miguel <span className="ml-1">☀️</span></h2><p className="mt-1 text-xs text-slate-400">Here's what's happening with your store today.</p></div><span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] dark:border-slate-800 dark:bg-slate-900"><Store size={14} className="text-indigo-500"/>{branch}<span className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-500"/>Store open</span></div><div className="space-y-5"><SummaryRow /></div></> }
