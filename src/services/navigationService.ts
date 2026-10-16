import {orderService} from './orderService';
import {customerService} from './customerService';
import {sidebarBadges} from '../config/sidebarBadges';
export const navigationService={counts:()=>({pendingOrders:orderService.list().filter(o=>o.orderStatus==='pending').length,customersWithBalance:customerService.list().filter(c=>c.creditBalance>0).length}),badge:(path:string)=>{const key=sidebarBadges[path];return key?navigationService.counts()[key]:0;}};
