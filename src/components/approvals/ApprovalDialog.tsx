import { useState } from 'react';
import { Modal } from '../common/Modal';
import { approvalService, ManagerApprovalRequired } from '../../services/approvalService';
import { useSettings } from '../../hooks/useSettings';
export function ApprovalDialog({scope,onApproved,onClose}:{scope:string;onApproved:()=>void|Promise<void>;onClose:()=>void}) {
 const [id,setId]=useState(''),[pin,setPin]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);const settings=useSettings(s=>s.manager);
 return <Modal open title="Manager approval required" onClose={onClose}><form className="space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);try{approvalService.authorize(scope,id,pin);await onApproved();onClose();}catch(cause){setError(cause instanceof Error?cause.message:'Approval failed');}finally{setBusy(false);}}}><label className="grid gap-2">Approver<select value={id} onChange={e=>setId(e.target.value)} required><option value="">Choose approver</option>{approvalService.approvers().map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>{settings.requirePin&&<label className="grid gap-2">4-digit demo PIN<input value={pin} onChange={e=>setPin(e.target.value)} inputMode="numeric" type="password" pattern="[0-9]{4}" maxLength={4} required/></label>}<p className="text-sm text-slate-500">{settings.demoPinHint}</p>{error&&<p role="alert" className="text-red-500">{error}</p>}<button className="btn-primary" disabled={busy}>Approve action</button></form></Modal>;
}
export function useApproval() {
 const [pending,setPending]=useState<{scope:string;action:()=>void|Promise<void>}>();
 const run=async(action:()=>void|Promise<void>)=>{try{await action();}catch(cause){if(cause instanceof ManagerApprovalRequired){setPending({scope:cause.scope,action});return;}throw cause;}};
 return {run,dialog:pending?<ApprovalDialog scope={pending.scope} onClose={()=>setPending(undefined)} onApproved={pending.action}/>:null};
}
