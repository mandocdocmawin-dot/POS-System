import {authService} from './authService';
import {posService} from './posService';
import {customerService} from './customerService';
import {settingsService} from './settingsService';
import type {Order} from '../types/pos';
import {orderService} from './orderService';
import {downloadFile} from '../utils/csv';
import {receiptHtml} from '../utils/receiptExport';
export type ReceiptDocument=Omit<Order,'id'|'orderNo'> & {id?:string;orderNo?:string;draft?:boolean};
export const receiptService={
 download:(receipt:ReceiptDocument)=>downloadFile(`${receipt.draft?'draft-invoice':receipt.orderNo??'receipt'}.html`,receiptHtml(receipt),'text/html;charset=utf-8'),
 draft:():ReceiptDocument=>{const s=posService.state();if(!s.cart.length)throw new Error('Add items to preview an invoice.');const c=customerService.get(s.customerId);return {...settingsService.snapshot(),draft:true,branchId:posService.branch(),customerId:s.customerId,customerName:c?.name??'Walk-in Customer',...posService.totals(),payments:[],amountPaid:0,balanceDue:posService.totals().grandTotal,change:0,paymentStatus:'unpaid',orderStatus:'pending',cashier:authService.getCurrentUser()?.name??'System',createdAt:new Date().toISOString(),note:s.note,refundedTotal:0,pointsEarned:0};},
 print:()=>{if(!document.getElementById('pos-receipt'))throw new Error('Open a receipt before printing.');const style=document.createElement('style');const width=document.getElementById('pos-receipt')?.style.getPropertyValue('--receipt-width')||settingsService.get().invoice.paperSize;style.textContent='@page { size: '+(width==='210mm'?'A4':width+' 297mm')+'; margin: 0; }';document.head.append(style);try{window.print();}finally{style.remove();}},
 get:(id:string):ReceiptDocument=>{const order=orderService.get(id);if(!order)throw new Error('Order not found.');return structuredClone(order);},
};

