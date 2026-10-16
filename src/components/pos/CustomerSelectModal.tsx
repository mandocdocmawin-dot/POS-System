import { useState } from 'react';
import { Modal } from '../common/Modal';
import { customerService } from '../../services/customerService';
import { posService } from '../../services/posService';
import { toast,errorMessage } from '../../services/toastService';
export function CustomerSelectModal({open,onClose}:{open:boolean;onClose:()=>void}) {
 const [search,setSearch]=useState('');
 const customers=customerService.list(search);
 return <Modal open={open} title="Select customer" onClose={onClose}>
  <input autoFocus className="mb-4 w-full" aria-label="Search customers" placeholder="Search name or phone…" value={search} onChange={e=>setSearch(e.target.value)}/>
  <div className="space-y-2">{customers.map(c=><button key={c.id} className="btn flex w-full justify-between p-3 text-left" onClick={()=>{try{posService.customer(c.id);onClose();}catch(e){toast.error(errorMessage(e));}}}><span>{c.name}<small className="block text-slate-400">{c.phone??(c.isWalkIn?'Default customer':'No phone')}</small></span><span className="text-xs">{c.tier} · {c.points} pts</span></button>)}</div>
  {!customers.length&&<p className="py-8 text-center text-sm text-slate-400">No matching customers.</p>}
 </Modal>;
}
