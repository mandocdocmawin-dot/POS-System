import { T } from "../../i18n/T";
import type {ComponentProps} from 'react';
import {Can} from '../auth/Can';
import {useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Modal} from '../common/Modal';
import {ConfirmDialog} from '../common/ConfirmDialog';
import {orderService} from '../../services/orderService';
import {formatPHP} from '../../utils/money';
import type {Order} from '../../types/pos';
function CancelOrderContent({order}:{order:Order}){const [params,setParams]=useSearchParams(),[open,setOpen]=useState(params.get('action')==='cancel'),[reason,setReason]=useState(''),[confirm,setConfirm]=useState(false);const close=()=>{setOpen(false);if(params.get('action')==='cancel')setParams({},{replace:true});};if(order.orderStatus!=='pending'||order.refundedTotal>0)return null;return <><button className="btn text-red-500" onClick={()=>setOpen(true)}><T text={"Cancel order"}/></button><Modal open={open&&!confirm} title="Cancel order" onClose={close}><form className="space-y-4" onSubmit={e=>{e.preventDefault();setConfirm(true);}}><label className="grid gap-2"><T text={"Cancellation reason"}/><textarea required value={reason} onChange={e=>setReason(e.target.value)}/></label><p>All items will return to stock. The customer’s balance will decrease by {formatPHP(order.balanceDue)}. Paid amount {formatPHP(order.amountPaid)} will be recorded as a cash refund.</p><button className="btn-primary" disabled={!reason.trim()}><T text={"Review cancellation"}/></button></form></Modal><ConfirmDialog open={confirm} title={`Cancel ${order.orderNo}?`} message={`Restore stock, clear the outstanding balance, and record any paid amount as refunded. Reason: ${reason}`} onClose={()=>{setConfirm(false);close();}} onConfirm={()=>orderService.cancel(order.id,reason)}/></>;}

export function CancelOrder(props:ComponentProps<typeof CancelOrderContent>){return <Can permission="orders:cancel"><CancelOrderContent {...props}/></Can>;}
