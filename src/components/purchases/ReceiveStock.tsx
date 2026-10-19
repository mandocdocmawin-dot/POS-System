import { T } from "../../i18n/T";
import {useState} from 'react';
import {Modal} from '../common/Modal';
import {LineItemsEditor,type EditableLine} from '../common/LineItemsEditor';
import {purchaseService} from '../../services/purchaseService';
import type {Purchase} from '../../types/phase4';
export function ReceiveStock({purchase,onClose}:{purchase:Purchase;onClose:()=>void}){const [lines,setLines]=useState<EditableLine[]>(purchase.items.map(l=>({id:l.id,name:l.name,quantity:0,max:l.orderedQty-l.receivedQty}))),[update,setUpdate]=useState(true),[error,setError]=useState('');return <Modal open title={`Receive ${purchase.purchaseNo}`} onClose={onClose}><div className="space-y-4"><LineItemsEditor lines={lines} onChange={setLines}/><label className="flex gap-2"><input type="checkbox" checked={update} onChange={e=>setUpdate(e.target.checked)}/>Update cost price to latest unit cost</label><p>Stock impact: add the quantities entered above. You can receive the remaining quantities later.</p>{error&&<p role="alert" className="text-red-500">{error}</p>}<button className="btn-primary" onClick={()=>{try{purchaseService.receive(purchase.id,lines.map(l=>({id:l.id,quantity:l.quantity})),update);onClose();}catch(e){setError(e instanceof Error?e.message:'Receiving failed.');}}}><T text={"Receive stock"}/></button></div></Modal>;}
