import {it,expect} from 'vitest';
import {movementBalances} from './movementBalances';
import type {StockMovement} from '../types/models';
const movement=(id:string,type:StockMovement['type'],quantity:number,patch:Partial<StockMovement>={}):StockMovement=>({id,type,quantity,productId:'p',reason:'Test',createdBy:'Demo',createdAt:'2026-01-01T00:00:00Z',...patch});
it('derives before and after for initial, in, out and signed adjustment',()=>{const balances=movementBalances([movement('1','initial',10),movement('2','out',3),movement('3','in',2),movement('4','adjustment',-1)],'Main Branch');expect([...balances.values()]).toEqual([{before:0,after:10},{before:10,after:7},{before:7,after:9},{before:9,after:8}]);});
it('keeps branch and variant balances separate',()=>{const balances=movementBalances([movement('1','initial',10),movement('2','initial',8,{variantId:'a'}),movement('3','out',2,{variantId:'a'}),movement('4','in',9,{branchId:'Elsewhere'})],'Main Branch');expect(balances.get('3')).toEqual({before:8,after:6});expect(balances.has('4')).toBe(false);});
it('sorts backdated entries while preserving insertion order for equal timestamps',()=>{const balances=movementBalances([movement('later','out',2,{createdAt:'2026-02-01T00:00:00Z'}),movement('first','initial',10),movement('second','in',3)],'Main Branch');expect(balances.get('later')).toEqual({before:13,after:11});});
