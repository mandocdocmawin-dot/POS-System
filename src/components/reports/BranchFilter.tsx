import { accountService } from '../../services/accountService';
export function BranchFilter({value,onChange}:{value:string;onChange:(s:string)=>void}){return <select aria-label="Branch" value={value} onChange={e=>onChange(e.target.value)}><option value="all">All branches</option>{accountService.branches().map(b=><option key={b}>{b}</option>)}</select>;}
