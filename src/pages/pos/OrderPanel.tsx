import {useState,type RefObject} from 'react';
import {ShoppingBag,Trash2,MoreHorizontal,Pencil,Pause,CreditCard,Receipt,Clock3,History,X} from 'lucide-react';
import type {Payment} from '../../types/pos';
import {useLocalData} from '../../services/useLocalData';
import {posService} from '../../services/posService';
import {orderService} from '../../services/orderService';
import {customerService} from '../../services/customerService';
import {holdService} from '../../services/holdService';
import {receiptService,type ReceiptDocument} from '../../services/receiptService';
import {toast,errorMessage} from '../../services/toastService';
import {usePosShortcuts} from '../../hooks/usePosShortcuts';
import {CartSummary} from '../../components/pos/CartSummary';
import {CartLine} from '../../components/pos/CartLine';
import {DiscountEditor} from '../../components/pos/DiscountEditor';
import {CustomerCard} from '../../components/pos/CustomerCard';
import {CustomerSelectModal} from '../../components/pos/CustomerSelectModal';
import {HeldOrdersDrawer} from '../../components/pos/HeldOrdersDrawer';
import {OrderTextModal} from '../../components/pos/OrderTextModal';
import {PaymentModal} from '../../components/pos/PaymentModal';
import {PayLaterModal} from '../../components/pos/PayLaterModal';
import {ReceiptDialog} from '../../components/pos/ReceiptDialog';
import {PosHistoryDrawer} from '../../components/pos/PosHistoryDrawer';
import {ShortcutsHelp} from '../../components/pos/ShortcutsHelp';
import {Popover} from '../../components/common/Popover';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
export function OrderPanel({isPhone=false,mobileOpen=false,onClose,panelRef}:{isPhone?:boolean;mobileOpen?:boolean;onClose?:()=>void;panelRef?:RefObject<HTMLElement|null>}) {
 useLocalData();const s=posService.state(),totals=posService.totals();
 const [discountOpen,setDiscountOpen]=useState(false),[selected,setSelected]=useState(''),[clear,setClear]=useState(false);
 const [customerOpen,setCustomerOpen]=useState(false),[holding,setHolding]=useState(false),[heldOpen,setHeldOpen]=useState(false),[noteOpen,setNoteOpen]=useState(false);
 const [paymentOpen,setPaymentOpen]=useState(false),[payLaterOpen,setPayLaterOpen]=useState(false),[historyOpen,setHistoryOpen]=useState(false);
 const [receipt,setReceipt]=useState<ReceiptDocument|null>(null);
 const complete=(payments:Payment[])=>{const order=posService.complete(payments);setPaymentOpen(false);setReceipt(order);toast.success('Sale saved: '+order.orderNo);};
 usePosShortcuts({customer:()=>setCustomerOpen(true),payment:()=>{if(s.cart.length)setPaymentOpen(true);},hold:()=>{if(s.cart.length)setHolding(true);},clear:()=>setClear(true),quantity:delta=>{const line=s.cart.find(l=>l.id===selected)??s.cart.at(-1);if(!line)return;try{posService.quantity(line.id,Math.max(Number.isInteger(line.quantity)?1:0.001,line.quantity+delta));}catch(e){toast.error(errorMessage(e));}}});
 const actions=[{label:'Payment',icon:CreditCard,click:()=>setPaymentOpen(true),disabled:!s.cart.length},{label:'Hold',icon:Pause,click:()=>setHolding(true),disabled:!s.cart.length},{label:'Invoice',icon:Receipt,click:()=>setReceipt(receiptService.draft()),disabled:!s.cart.length},{label:'Pay Later',icon:Clock3,click:()=>setPayLaterOpen(true),disabled:!s.cart.length},{label:'History',icon:History,click:()=>setHistoryOpen(true),disabled:false}];
 return <aside ref={panelRef} tabIndex={-1} role={isPhone&&mobileOpen?'dialog':undefined} aria-modal={isPhone&&mobileOpen?true:undefined} aria-label="Current order" className={`${isPhone&&!mobileOpen?'hidden':'flex'} w-full shrink-0 flex-col border-slate-200 bg-white p-4 md:w-[340px] md:overflow-y-auto md:border-l xl:w-[380px] 2xl:w-[420px] dark:border-slate-800 dark:bg-slate-900 ${isPhone?'fixed inset-x-0 bottom-0 z-40 max-h-[88dvh] overflow-y-auto rounded-t-2xl border-t shadow-xl':''}`}>
  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800"><h2 className="text-xs font-semibold">Order ID: #{orderService.nextOrderNo()}</h2><div className="flex gap-1"><ShortcutsHelp/><Popover label="Order options" trigger={<MoreHorizontal size={15}/>} className="btn px-2"><button className="btn" onClick={()=>setHeldOpen(true)}>Held orders ({holdService.list().length})</button></Popover><button className="btn px-2" aria-label="Edit order note" onClick={()=>setNoteOpen(true)}><Pencil size={14}/></button><button className="btn px-2 text-red-500" aria-label="Clear cart" onClick={()=>setClear(true)}><Trash2 size={15}/></button>{isPhone&&<button className="btn px-2" aria-label="Close cart" onClick={onClose}><X size={16}/></button>}</div></div>
  <CustomerCard customer={customerService.get(s.customerId)} onSelect={()=>setCustomerOpen(true)}/>
  <div className="my-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Order Detail (Items: {s.cart.length})</h3><button className="text-xs text-red-500" onClick={()=>setClear(true)}>Clear All</button></div>
  {s.cart.length?totals.items.map(l=><CartLine key={`${l.id}-${l.quantity}`} line={l} selected={selected===l.id} onSelect={()=>setSelected(l.id)}/>):<div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-slate-400"><ShoppingBag size={65} strokeWidth={1}/><p>Your cart is empty</p><p className="text-xs">Select products to start a sale.</p></div>}
  <CartSummary totals={totals} onDiscount={()=>setDiscountOpen(v=>!v)}/>{discountOpen&&<DiscountEditor value={s.orderDiscount} onSave={(v,approver)=>{posService.discount(v,approver);}} onClose={()=>setDiscountOpen(false)}/>}
  {s.note&&<p className="mt-3 break-words text-xs text-slate-500">Note: {s.note}</p>}
  <button className="btn-primary mt-4 w-full disabled:opacity-40" disabled={!s.cart.length} onClick={()=>setPaymentOpen(true)}>Process to Payment →</button>
  <div className="mt-4 grid grid-cols-5 gap-1">{actions.map(a=><button key={a.label} disabled={a.disabled} className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 px-1 py-2 text-[10px] hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800" onClick={a.click}><a.icon size={16}/><span>{a.label}{a.label==='Hold'?` (${holdService.list().length})`:''}</span></button>)}</div>
  <button className="mt-3 text-xs text-indigo-500" onClick={()=>setHeldOpen(true)}>View held orders ({holdService.list().length})</button>
  <CustomerSelectModal open={customerOpen} onClose={()=>setCustomerOpen(false)}/>
  {holding&&<OrderTextModal title="Hold order" label="Label (optional)" onSave={label=>{holdService.hold(label);}} onClose={()=>setHolding(false)}/>}
  {noteOpen&&<OrderTextModal title="Order note" label="Note" initial={s.note} onSave={note=>{posService.note(note);}} onClose={()=>setNoteOpen(false)}/>}
  {paymentOpen&&<PaymentModal onComplete={complete} onClose={()=>setPaymentOpen(false)}/>}
  {payLaterOpen&&<PayLaterModal onClose={()=>setPayLaterOpen(false)} onSelectCustomer={()=>{setPayLaterOpen(false);setCustomerOpen(true);toast.info('Select a customer, then choose Pay Later again.');}} onComplete={order=>{setPayLaterOpen(false);setReceipt(order);toast.success('Credit sale saved: '+order.orderNo);}}/>}
  <PosHistoryDrawer open={historyOpen} onClose={()=>setHistoryOpen(false)}/><HeldOrdersDrawer open={heldOpen} onClose={()=>setHeldOpen(false)}/>
  <ReceiptDialog receipt={receipt} onClose={()=>setReceipt(null)}/>
  <ConfirmDialog open={clear} title="Clear current cart?" message="All current items, discounts, customer and notes will be cleared." onClose={()=>setClear(false)} onConfirm={()=>{posService.clear();}}/>
 </aside>;
}
