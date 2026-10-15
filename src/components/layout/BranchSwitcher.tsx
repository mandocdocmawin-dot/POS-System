import { Store, ChevronDown, Check } from 'lucide-react'
import { branches, useBranchStore } from '../../store/useBranchStore'
import { Popover } from '../common/Popover'
export function BranchSwitcher() { const { branch, setBranch } = useBranchStore(); return <Popover label="Switch branch" align="left" className="btn" trigger={<><Store size={16}/><span className="hidden sm:inline">{branch}</span><ChevronDown size={13}/></>}><div className="w-48">{branches.map(b => <button onClick={() => setBranch(b)} className="flex w-full items-center gap-3 rounded-lg p-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" key={b}><Store size={15}/><span className="flex-1 text-left">{b}</span>{branch === b && <Check size={14}/>}</button>)}</div></Popover> }
