import { T } from "../../i18n/T";
import {branchService} from '../../services/branchService';
export function BranchFilter({value,onChange}:{value:string;onChange:(s:string)=>void}){const branches=branchService.reportBranches();return <select aria-label="Branch scope" value={value} onChange={e=>onChange(e.target.value)}>{branches.length>=2&&<option value="all"><T text={"All branches"}/></option>}{branches.map(b=><option value={b.id} key={b.id}>{b.name}{b.status==='inactive'?' (inactive)':''}</option>)}</select>;}
