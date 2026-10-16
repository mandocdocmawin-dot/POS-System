import {posService} from './posService';
import {customerService} from './customerService';
import {POS_CONFIG} from '../config/pos';
import type {Order} from '../types/pos';
import {orderService} from './orderService';
export type ReceiptDocument=Omit<Order,'id'|'orderNo'> & {id?:string;orderNo?:string;draft?:boolean};
export const receiptService={
 draft:():ReceiptDocument=>{const s=posService.state();if(!s.cart.length)throw new Error('Add items to preview an invoice.');const c=customerService.get(s.customerId);return {draft:true,branchId:posService.branch(),customerId:s.customerId,customerName:c?.name??'Walk-in Customer',...posService.totals(),payments:[],amountPaid:0,balanceDue:posService.totals().grandTotal,change:0,paymentStatus:'unpaid',orderStatus:'pending',cashier:'Demo Admin',createdAt:new Date().toISOString(),note:s.note,pointsEarned:0};},
 print:()=>{if(!document.getElementById('pos-receipt'))throw new Error('Open a receipt before printing.');const style=document.createElement('style');style.textContent='@page { size: '+POS_CONFIG.receiptWidth+'mm 297mm; margin: 0; }';document.head.append(style);try{window.print();}finally{style.remove();}},
 get:(id:string):ReceiptDocument=>{const order=orderService.get(id);if(!order)throw new Error('Order not found.');return structuredClone(order);},
};
