import { storageOptions } from '../core/storage/options';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {stockTransferSchema,type StockTransfer} from '../types/settings';
export const useTransferStore=create<{transfers:StockTransfer[]}>()(persist(()=>({transfers:[] as StockTransfer[]}),{name:'tindapos:stock-transfers', ...storageOptions('tindapos:stock-transfers'),version:1,merge:(value,current)=>{const parsed=stockTransferSchema.array().safeParse((value as {transfers?:unknown}|undefined)?.transfers);return parsed.success?{transfers:parsed.data}:current;}}));

