import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {Refund} from '../types/phase4';
export interface RefundState {refunds:Refund[];counter:number}
export const useRefundStore=create<RefundState>()(persist<RefundState>(()=>({refunds:[],counter:0}),{name:'tindapos:refund', ...storageOptions('tindapos:refund'),version:1}));
