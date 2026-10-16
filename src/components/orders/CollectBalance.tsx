import type {ComponentProps} from 'react';
import {Can} from '../auth/Can';
import {useState} from 'react';
import {Modal} from '../common/Modal';
import {AmountInput} from '../common/AmountInput';
import {orderService} from '../../services/orderService';
import type {PaymentMethod} from '../../types/pos';
import {formatPHP} from '../../utils/money';
function CollectBalanceContent({orderId,customerId,balance}:{orderId?:string;customerId?:string;balance:number}){const [open,setOpen]=useState(false),[amount,setAmount]=useState(balance),[method,setMethod]=useState<PaymentMethod>('cash'),[reference,setReference]=useState(''),[error,setError]=useState('');if(balance<=0)return null;return <><button className="btn-primary" onClick={()=>{setAmount(balance);setError('');setOpen(true);}}>{orderId?'Collect balance':'Collect all balances'}</button><Modal open={open} title="Collect customer balance" onClose={()=>setOpen(false)}><form className="space-y-4" onSubmit={e=>{e.preventDefault();try{const input={amount,method,reference};if(orderId)orderService.collect(orderId,input);else if(customerId)orderService.collectAll(customerId,input);setOpen(false);}catch(e){setError(e instanceof Error?e.message:'Payment failed.');}}}><p>Outstanding: {formatPHP(balance)}. {customerId&&'Payment applies to oldest orders first.'}</p><AmountInput required value={amount} max={balance} onChange={setAmount}/><label className="grid gap-1">Method<select value={method} onChange={e=>setMethod(e.target.value as PaymentMethod)}>{['cash','gcash','maya','card','bank','wallet'].map(x=><option key={x}>{x}</option>)}</select></label><label className="grid gap-1">Reference<input value={reference} onChange={e=>setReference(e.target.value)}/></label>{error&&<p role="alert" className="text-red-500">{error}</p>}<p className="text-xs text-slate-500">Demo payment record only.</p><button className="btn-primary" disabled={amount<=0||amount>balance}>Record payment</button></form></Modal></>;}

export function CollectBalance(props:ComponentProps<typeof CollectBalanceContent>){return <Can permission="customers:manage"><CollectBalanceContent {...props}/></Can>;}
