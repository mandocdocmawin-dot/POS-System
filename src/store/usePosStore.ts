import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type {CartItem, Discount, DiscountApproval} from '../types/pos';
import {WALK_IN_ID} from '../config/pos';
export interface PosState {cart:CartItem[]; customerId:string; orderDiscount:Discount; note:string; activeOrderNo:string;discountApproval?:DiscountApproval;couponCode?:string}
export const usePosStore=create<PosState>()(persist<PosState>(()=>({cart:[],customerId:WALK_IN_ID,orderDiscount:{type:'fixed',value:0},note:'',activeOrderNo:'TP-000001'}),{name:'tindapos:pos',version:1}));
