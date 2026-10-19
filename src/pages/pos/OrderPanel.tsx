import {PaymentSuccess} from '../../components/pos/PaymentSuccess';
import {CouponControl} from '../../components/coupons/CouponControl';
import {usePermission} from '../../hooks/usePermission';
import {Can} from '../../components/auth/Can';
import {useState,type RefObject} from 'react';
import {ShoppingBag,Trash2,MoreHorizontal,Pencil,Pause,CreditCard,Receipt,Clock3,History,X} from 'lucide-react';
import type {Payment,Discount} from '../../types/pos';
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
import {Popover} from '../../components/common/Popover';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
export function OrderPanel({isPhone=false,mobileOpen=false,onClose,panelRef}:{isPhone?:boolean;mobileOpen?:boolean;onClose?:()=>void;panelRef?:RefObject<HTMLElement|null>}) {
 const {can}=usePermission();
 useLocalData();const s=posService.state(),totals=posService.totals();
 const [replaceCoupon,setReplaceCoupon]=useState<{discount:Discount;approver?:string}>();
 const [discountOpen,setDiscountOpen]=useState(false),[selected,setSelected]=useState(''),[clear,setClear]=useState(false);
 const [customerOpen,setCustomerOpen]=useState(false),[holding,setHolding]=useState(false),[heldOpen,setHeldOpen]=useState(false),[noteOpen,setNoteOpen]=useState(false);
 const [paymentOpen,setPaymentOpen]=useState(false),[payLaterOpen,setPayLaterOpen]=useState(false),[historyOpen,setHistoryOpen]=useState(false);
 const [receipt,setReceipt]=useState<ReceiptDocument|null>(null),[success,setSuccess]=useState<ReceiptDocument|null>(null);
 const complete=(payments:Payment[])=>{const order=posService.complete(payments);setPaymentOpen(false);setSuccess(order);toast.success('Sale saved: '+order.orderNo);};
 usePosShortcuts({customer:()=>setCustomerOpen(true),payment:()=>{if(s.cart.length)setPaymentOpen(true);},hold:()=>{if(s.cart.length&&can('pos:hold'))setHolding(true);},clear:()=>setClear(true),quantity:delta=>{const line=s.cart.find(l=>l.id===selected)??s.cart.at(-1);if(!line)return;try{posService.quantity(line.id,Math.max(Number.isInteger(line.quantity)?1:0.001,line.quantity+delta));}catch(e){toast.error(errorMessage(e));}}});
 const actions=[{label:'Payment',tone:'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',icon:CreditCard,click:()=>setPaymentOpen(true),permission:'pos:use',disabled:!s.cart.length},{label:'Hold',tone:'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',permission:'pos:hold',icon:Pause,click:()=>setHolding(true),disabled:!s.cart.length},{label:'Invoice',tone:'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300',permission:'pos:use',icon:Receipt,click:()=>setReceipt(receiptService.draft()),disabled:!s.cart.length},{label:'Pay Later',tone:'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',permission:'pos:use',icon:Clock3,click:()=>setPayLaterOpen(true),disabled:!s.cart.length},{label:'History',tone:'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',permission:'orders:view',icon:History,click:()=>setHistoryOpen(true),disabled:false}];
 return <aside ref={panelRef} tabIndex={-1} role={isPhone&&mobileOpen?'dialog':undefined} aria-modal={isPhone&&mobileOpen?true:undefined} aria-label="Current order" className={`${isPhone&&!mobileOpen?'hidden':'flex'} pos-order-panel min-h-0 w-full shrink-0 flex-col overflow-hidden border-slate-200 bg-white p-4 md:w-[340px] md:border-l xl:w-[380px] 2xl:w-[420px] dark:border-slate-800 dark:bg-slate-900 ${isPhone?'fixed inset-x-0 bottom-0 z-40 h-[88dvh] rounded-t-2xl border-t shadow-xl':''}`}>
  <div className="shrink-0"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800"><h2 className="text-xs font-semibold">Order ID: #{orderService.nextOrderNo()}</h2><div className="flex gap-1"><Popover label="Order options" trigger={<MoreHorizontal size={15}/>} className="btn px-2"><Can permission="pos:hold"><button className="btn" onClick={()=>setHeldOpen(true)}>Held orders ({holdService.list().length})</button></Can></Popover><button className="btn px-2" aria-label="Edit order note" onClick={()=>setNoteOpen(true)}><Pencil size={14}/></button><button className="btn px-2 text-red-500" aria-label="Clear cart" onClick={()=>setClear(true)}><Trash2 size={15}/></button>{isPhone&&<button className="btn px-2" aria-label="Close cart" onClick={onClose}><X size={16}/></button>}</div></div>
  <CustomerCard customer={customerService.get(s.customerId)} onSelect={()=>setCustomerOpen(true)}/>
  <div className="my-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Order Detail (Items: {s.cart.length})</h3><button className="text-xs text-red-500" onClick={()=>setClear(true)}>Clear All</button></div>
  </div>{/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The labeled scroll region needs keyboard focus so Arrow/Page keys can scroll cart items. */}
  <div className="pos-cart-items min-h-0 flex-1 overflow-y-auto overscroll-contain" role="region" aria-label="Items in current order" tabIndex={0}>
  {s.cart.length?totals.items.map(l=><CartLine key={`${l.id}-${l.quantity}`} line={l} selected={selected===l.id} onSelect={()=>setSelected(l.id)}/>):<div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-slate-400"><ShoppingBag size={65} strokeWidth={1}/><p>Your cart is empty</p><p className="text-xs">Select products to start a sale.</p></div>}
  </div><div className="pos-checkout-summary shrink-0 overflow-y-auto"><Can permission="pos:coupon"><CouponControl/></Can><CartSummary totals={totals} onDiscount={()=>setDiscountOpen(v=>!v)}/>{discountOpen&&<DiscountEditor value={s.orderDiscount} onSave={(v,approver)=>{if(s.couponCode&&v.value>0)setReplaceCoupon({discount:v,approver});else posService.discount(v,approver);}} onClose={()=>setDiscountOpen(false)}/>}
  {s.note&&<p className="mt-3 break-words text-xs text-slate-500">Note: {s.note}</p>}
  </div><div className="pos-checkout-actions shrink-0 border-t border-slate-100 pt-3 dark:border-slate-800"><button className="btn-primary w-full disabled:opacity-40" disabled={!s.cart.length} onClick={()=>setPaymentOpen(true)}>Process to Payment →</button>
  <div className="mt-3 grid grid-cols-5 gap-1" aria-label="Order actions">{actions.map(a=><button key={a.label} disabled={a.disabled||!can(a.permission)} title={!can(a.permission)?"Your role can't do this":undefined} className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-lg px-1 py-1 text-[10px] hover:bg-slate-50 disabled:opacity-40 dark:hover:bg-slate-800" onClick={a.click}><span className={`flex h-9 w-9 items-center justify-center rounded-full ${a.tone}`}><a.icon size={18} aria-hidden="true"/></span><span>{a.label}{a.label==='Hold'?` (${holdService.list().length})`:''}</span></button>)}</div>
  <Can permission="pos:hold"><button className="mt-3 text-xs text-indigo-500" onClick={()=>setHeldOpen(true)}>View held orders ({holdService.list().length})</button></Can>
  </div><CustomerSelectModal open={customerOpen} onClose={()=>setCustomerOpen(false)}/>
  {holding&&<OrderTextModal title="Hold order" label="Label (optional)" onSave={label=>{holdService.hold(label);}} onClose={()=>setHolding(false)}/>}
  {noteOpen&&<OrderTextModal title="Order note" label="Note" initial={s.note} onSave={note=>{posService.note(note);}} onClose={()=>setNoteOpen(false)}/>}
  {paymentOpen&&<PaymentModal onComplete={complete} onClose={()=>setPaymentOpen(false)}/>}
  {payLaterOpen&&<PayLaterModal onClose={()=>setPayLaterOpen(false)} onSelectCustomer={()=>{setPayLaterOpen(false);setCustomerOpen(true);toast.info('Select a customer, then choose Pay Later again.');}} onComplete={order=>{setPayLaterOpen(false);setReceipt(order);toast.success('Credit sale saved: '+order.orderNo);}}/>}
  <PosHistoryDrawer open={historyOpen} onClose={()=>setHistoryOpen(false)}/><HeldOrdersDrawer open={heldOpen} onClose={()=>setHeldOpen(false)}/>
  <ReceiptDialog receipt={receipt} onClose={()=>setReceipt(null)} onPayment={receipt?.draft?()=>{setReceipt(null);setPaymentOpen(true);}:undefined}/><PaymentSuccess receipt={success} onClose={()=>setSuccess(null)} onReceipt={()=>{setReceipt(success);setSuccess(null);}}/>
  <ConfirmDialog open={!!replaceCoupon} title="Replace coupon with order discount?" message="A coupon and manual order discount cannot be combined." onClose={()=>setReplaceCoupon(undefined)} onConfirm={()=>{if(replaceCoupon)posService.discount(replaceCoupon.discount,replaceCoupon.approver,true);}}/>
  <ConfirmDialog open={clear} title="Clear current cart?" message="All current items, discounts, customer and notes will be cleared." onClose={()=>setClear(false)} onConfirm={()=>{posService.clear();}}/>
 </aside>;
}
