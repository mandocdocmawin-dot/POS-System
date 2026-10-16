import {POS_CONFIG} from '../config/pos';
import type {Order} from '../types/pos';
import {orderService} from './orderService';
export type ReceiptDocument=Omit<Order,'id'|'orderNo'> & {id?:string;orderNo?:string;draft?:boolean};
export const receiptService={
 print:()=>{if(!document.getElementById('pos-receipt'))throw new Error('Open a receipt before printing.');const style=document.createElement('style');style.textContent='@page { size: '+POS_CONFIG.receiptWidth+'mm 297mm; margin: 0; }';document.head.append(style);try{window.print();}finally{style.remove();}},
 get:(id:string):ReceiptDocument=>{const order=orderService.get(id);if(!order)throw new Error('Order not found.');return structuredClone(order);},
};
