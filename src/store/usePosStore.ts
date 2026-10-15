import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {CartItem, Discount} from '../types/pos';
import {WALK_IN_ID} from '../config/pos';
export interface PosState {cart:CartItem[]; customerId:string; orderDiscount:Discount; note:string; activeOrderNo:string}
export const usePosStore=create<PosState>()(persist<PosState>(()=>({cart:[],customerId:WALK_IN_ID,orderDiscount:{type:'fixed',value:0},note:'',activeOrderNo:'TP-000001'}),{name:'tindapos:poss',version:1}));
