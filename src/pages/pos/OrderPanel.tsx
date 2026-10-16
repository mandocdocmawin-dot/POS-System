import {PayLaterModal} from '../../components/pos/PayLaterModal';
import type {Order,Payment} from '../../types/pos';
import {Modal} from '../../components/common/Modal';
import {toast} from '../../services/toastService';
import {formatPHP} from '../../utils/money';
import {PaymentModal} from '../../components/pos/PaymentModal';
import {holdService} from '../../services/holdService';
import {HeldOrdersDrawer} from '../../components/pos/HeldOrdersDrawer';
import {OrderTextModal} from '../../components/pos/OrderTextModal';
import {Popover} from '../../components/common/Popover';
import {MoreHorizontal,Pencil,Pause} from 'lucide-react';
import {CustomerCard} from '../../components/pos/CustomerCard';
import {CustomerSelectModal} from '../../components/pos/CustomerSelectModal';
import {customerService} from '../../services/customerService';
import {CartSummary} from '../../components/pos/CartSummary';
import {DiscountEditor} from '../../components/pos/DiscountEditor';
import {useState} from 'react';
import {ShoppingBag,Trash2} from 'lucide-react';
import {useLocalData} from '../../services/useLocalData';
import {posService} from '../../services/posService';
import {orderService} from '../../services/orderService';
import {CartLine} from '../../components/pos/CartLine';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
export function OrderPanel(){
 useLocalData();const s=posService.state(),totals=posService.totals();
 const [payLaterOpen,setPayLaterOpen]=useState(false);
 const [receipt,setReceipt]=useState<Order|null>(null);
 const complete=(payments:Payment[])=>{const order=posService.complete(payments);setPaymentOpen(false);setReceipt(order);toast.success('Sale saved: '+order.orderNo);};
 const [paymentOpen,setPaymentOpen]=useState(false);
 const [holding,setHolding]=useState(false),[heldOpen,setHeldOpen]=useState(false),[noteOpen,setNoteOpen]=useState(false);
 const [customerOpen,setCustomerOpen]=useState(false);
 const [discountOpen,setDiscountOpen]=useState(false);
 const [selected,setSelected]=useState(''),[clear,setClear]=useState(false);
 return <aside aria-label="Current order" className="flex w-full shrink-0 flex-col border-l border-slate-200 bg-white p-5 xl:w-[380px] xl:overflow-y-auto 2xl:w-[420px] dark:border-slate-800 dark:bg-slate-900">
 <div className="flex items-center justify-between border-b pb-4"><h2 className="text-sm font-semibold">Order ID: #{orderService.nextOrderNo()}</h2><div className="flex gap-1"><Popover label="Order options" trigger={<MoreHorizontal size={15}/>} className="btn px-2"><button className="btn" onClick={()=>setHeldOpen(true)}>Held orders ({holdService.list().length})</button></Popover><button className="btn px-2" aria-label="Edit order note" onClick={()=>setNoteOpen(true)}><Pencil size={14}/></button><button className="btn text-red-500" aria-label="Clear cart" onClick={()=>setClear(true)}><Trash2 size={15}/></button></div></div>
 <CustomerCard customer={customerService.get(s.customerId)} onSelect={()=>setCustomerOpen(true)}/><CustomerSelectModal open={customerOpen} onClose={()=>setCustomerOpen(false)}/>
 <div className="my-5 flex items-center justify-between"><h3 className="text-sm font-semibold">Order Detail (Items: {s.cart.length})</h3><button className="text-xs text-red-500" onClick={()=>setClear(true)}>Clear All</button></div>
 {s.cart.length?totals.items.map(l=><CartLine key={`${l.id}-${l.quantity}`} line={l} selected={selected===l.id} onSelect={()=>setSelected(l.id)}/>):<div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-slate-400"><ShoppingBag size={65} strokeWidth={1}/><p>Your cart is empty</p><p className="text-xs">Select products to start a sale.</p></div>}
 <CartSummary totals={totals} onDiscount={()=>setDiscountOpen(v=>!v)}/>{discountOpen&&<DiscountEditor value={s.orderDiscount} onSave={v=>{posService.discount(v);}} onClose={()=>setDiscountOpen(false)}/>}
 {s.note&&<p className="mt-3 break-words text-xs text-slate-500">Note: {s.note}</p>}
 <button className="btn-primary mt-5 w-full disabled:opacity-40" disabled={!s.cart.length} onClick={()=>setPaymentOpen(true)}>Process to Payment →</button>
 {paymentOpen&&<PaymentModal onComplete={complete} onClose={()=>setPaymentOpen(false)}/>}
 {payLaterOpen&&<PayLaterModal onClose={()=>setPayLaterOpen(false)} onSelectCustomer={()=>{setPayLaterOpen(false);setCustomerOpen(true);toast.info('Select a customer, then choose Pay Later again.');}} onComplete={order=>{setPayLaterOpen(false);setReceipt(order);toast.success('Credit sale saved: '+order.orderNo);}}/>}
 <button className="btn mt-3 disabled:opacity-40" disabled={!s.cart.length} onClick={()=>setPayLaterOpen(true)}>Pay Later</button>
 <div className="mt-4 flex gap-2"><button disabled={!s.cart.length} className="btn flex-1 disabled:opacity-40" onClick={()=>setHolding(true)}><Pause size={14}/>Hold</button><button className="btn" onClick={()=>setHeldOpen(true)} aria-label="Open held orders">Held ({holdService.list().length})</button></div>
 {holding&&<OrderTextModal title="Hold order" label="Label (optional)" onSave={label=>{holdService.hold(label);}} onClose={()=>setHolding(false)}/>}
 {noteOpen&&<OrderTextModal title="Order note" label="Note" initial={s.note} onSave={note=>{posService.note(note);}} onClose={()=>setNoteOpen(false)}/>}
 <HeldOrdersDrawer open={heldOpen} onClose={()=>setHeldOpen(false)}/>
 <Modal open={!!receipt} title="Sale saved" onClose={()=>setReceipt(null)}>{receipt&&<p>{receipt.orderNo} · {formatPHP(receipt.grandTotal)} · {receipt.pointsEarned} points earned</p>}<button className="btn-primary mt-4" onClick={()=>setReceipt(null)}>New Sale</button></Modal>
 <ConfirmDialog open={clear} title="Clear current cart?" message="All current items, discounts, customer and notes will be cleared." onClose={()=>setClear(false)} onConfirm={()=>{posService.clear();}}/>
 </aside>;
}

