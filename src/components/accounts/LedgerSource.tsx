import type { LedgerEntry } from '../../types/accounts';
import { EntityLink } from '../common/EntityLink';
export function LedgerSource({entry:e}:{entry:LedgerEntry}){const type=e.sourceType==='payroll'?'payroll':e.sourceType==='wallet'?'customers':e.sourceType==='supplier_payment'?'suppliers':'orders';return <div>{e.isAuto&&e.sourceId&&e.sourceType!=='transfer'?<EntityLink type={type} id={e.sourceId}>{e.reference??e.category}</EntityLink>:<span>{e.payee??e.reference??e.note??'Manual entry'}</span>}{e.note&&<p className="mt-1 max-w-xs truncate text-xs text-slate-500">{e.note}</p>}</div>;}
