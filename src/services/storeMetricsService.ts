import {branchService} from './branchService';
import {stockService} from './stockService';
import {orderService} from './orderService';
import {toCentavos,multiplyCentavos} from '../utils/pos';
import {localDate} from '../utils/date';
export const storeMetricsService={list:()=>branchService.list().map(b=>{const items=stockService.items(b.id),orders=orderService.list({branchId:b.id}).filter(o=>o.orderStatus!=='cancelled');return {...b,staffCount:branchService.staff(b.id).length,stockValue:items.reduce((n,i)=>n+multiplyCentavos(toCentavos(i.cost),Math.max(0,i.stock)),0),lowStock:items.filter(i=>i.stock<=i.product.reorderLevel).length,todaySales:orders.filter(o=>localDate(new Date(o.createdAt))===localDate()).reduce((n,o)=>n+toCentavos(o.grandTotal)-toCentavos(o.refundedTotal),0)};})};
