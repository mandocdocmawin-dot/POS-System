import {activityService} from './activityService';
import {useOrderStore} from '../store/useOrderStore';
import {useBranchStore} from '../store/useBranchStore';
import {usePosStore} from '../store/usePosStore';
import {orderSchema,type Order} from '../types/pos';
import {formatOrderNo} from '../utils/orderNo';
export const orderService={
 list:(options:{today?:boolean;search?:string;branchId?:string}={})=>structuredClone(useOrderStore.getState().orders.filter(o=>o.branchId===(options.branchId??useBranchStore.getState().branch)&&(!options.today||new Date(o.createdAt).toDateString()===new Date().toDateString())&&(!options.search||o.orderNo.toLowerCase().includes(options.search.toLowerCase()))).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt))),
 get:(id:string)=>structuredClone(useOrderStore.getState().orders.find(o=>o.id===id)),
 nextOrderNo:()=>formatOrderNo(useOrderStore.getState().counter+1),
 save:(input:Order)=>{const order=orderSchema.parse(input);const state=useOrderStore.getState();if(order.orderNo!==orderService.nextOrderNo())throw new Error('Order number changed. Please retry.');if(state.orders.some(o=>o.id===order.id))throw new Error('Sale already saved.');useOrderStore.setState({orders:[...state.orders,order],counter:state.counter+1});usePosStore.setState({activeOrderNo:orderService.nextOrderNo()});activityService.log("order",order.id,"create",`Created ${order.orderNo}`);return order;},
};
