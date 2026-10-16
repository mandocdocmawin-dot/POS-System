import type {Order} from '../types/pos';
import {orderService} from './orderService';
export type ReceiptDocument=Omit<Order,'id'|'orderNo'> & {id?:string;orderNo?:string;draft?:boolean};
export const receiptService={
 get:(id:string):ReceiptDocument=>{const order=orderService.get(id);if(!order)throw new Error('Order not found.');return structuredClone(order);},
};
