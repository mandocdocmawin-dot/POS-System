import type {CSSProperties} from 'react';
import type {ReceiptDocument} from '../../services/receiptService';
import {formatPHP} from '../../utils/money';
import {POS_CONFIG,PAYMENT_METHODS} from '../../config/pos';
export function ReceiptView({receipt:o}:{receipt:ReceiptDocument}) {
 const row=(label:string,value:number,bold=false)=><div className={`flex justify-between gap-3 ${bold?'font-bold':''}`}><span>{label}</span><span className="whitespace-nowrap">{formatPHP(value)}</span></div>;
 return <article id="pos-receipt" style={{'--receipt-width':`${POS_CONFIG.receiptWidth}mm`} as CSSProperties} className="receipt relative mx-auto max-w-full bg-white p-4 font-mono text-xs text-black">
  {o.draft&&<div className="receipt-watermark pointer-events-none absolute inset-0 flex items-center justify-center text-6xl font-bold text-black/10" aria-hidden="true">DRAFT</div>}
  <header className="mb-4 text-center"><h2 className="text-xl font-bold !text-black">TindaPOS</h2><p>{o.branchId}</p><p>Store address · Philippines</p><p className="mt-3 font-bold">{o.draft?'DRAFT INVOICE':o.orderNo}</p><p>{new Date(o.createdAt).toLocaleString()}</p></header>
  <p>Cashier: {o.cashier}</p><p>Customer: {o.customerName}</p>
  <table className="my-3 w-full border-y border-dashed border-black text-left"><caption className="sr-only">Receipt items</caption><thead><tr><th className="py-2">Item / Qty</th><th className="text-right">Price</th><th className="text-right">Total</th></tr></thead><tbody>{o.items.map(l=><tr key={l.id} className="align-top"><td className="max-w-28 break-words py-2 pr-1">{l.name}{l.variantName&&<span className="block">{l.variantName}</span>}<span className="block">{l.quantity} {l.unitShortName}</span>{l.lineDiscount>0&&<small className="block">Item discount: −{formatPHP(l.lineDiscount)}</small>}{l.orderDiscountAmount>0&&<small className="block">Order discount: −{formatPHP(l.orderDiscountAmount)}</small>}</td><td className="py-2 text-right">{formatPHP(l.unitPrice)}</td><td className="py-2 text-right">{formatPHP(l.lineTotal)}</td></tr>)}</tbody></table>
  <div className="space-y-1.5">{row('Subtotal',o.subtotal)}{row('Item discounts',-o.itemDiscountTotal)}{row('Order discount',-o.orderDiscount.amount)}{row(`VAT (${POS_CONFIG.taxMode==='inclusive'?'included':'exclusive'})`,o.taxTotal)}<div className="border-t border-dashed border-black pt-2 text-base">{row('Grand Total',o.grandTotal,true)}</div></div>
  {!o.draft&&<div className="mt-4 space-y-1.5 border-t border-dashed border-black pt-3">{o.payments.map(p=><div key={p.id}>{row(PAYMENT_METHODS.find(m=>m.id===p.method)?.label??p.method,p.amount)}{p.reference&&<p className="break-all">Ref: {p.reference}</p>}</div>)}{row('Amount paid',o.amountPaid)}{row('Change',o.change)}{o.balanceDue>0&&<div className="border-2 border-black p-2">{row('BALANCE DUE',o.balanceDue,true)}{o.dueDate&&<p>Due: {o.dueDate}</p>}</div>}<p>Points earned: {o.pointsEarned}</p></div>}
  {o.note&&<p className="mt-3 break-words">Note: {o.note}</p>}
  <footer className="mt-5 text-center"><p>{o.draft?'Draft preview · no sale recorded':'Thank you!'}</p>{o.orderNo&&<><div aria-hidden="true" className="receipt-bars mx-auto mt-4 h-9 w-4/5"/><p className="mt-1 tracking-widest">{o.orderNo}</p></>}</footer>
 </article>;
}
