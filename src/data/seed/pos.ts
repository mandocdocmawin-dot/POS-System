import {WALK_IN_ID} from '../../config/pos';
import type {Customer,Order,PaymentMethod} from '../../types/pos';
import type {StockMovement} from '../../types/models';
import {products} from './products';
import {movements as openingMovements} from './movements';
import {units} from './units';
import {calculateTotals} from '../../utils/pos';
import {formatOrderNo} from '../../utils/orderNo';
export function createPosSeed() {
 const now=new Date();
 const customers:Customer[]=['Walk-in Customer','Maria Santos','Jose Cruz','Ana Reyes','Carlo Garcia','Bea Dela Cruz'].map((name,i)=>({id:i===0?WALK_IN_ID:`customer-${i}`,name,phone:i ? `0917000000${i}`:undefined,email:i?name.toLowerCase().replaceAll(' ','.')+'@example.com':undefined,address:i?['','Quezon City','Makati','Manila','Pasig','Taguig'][i]:undefined,points:0,tier:'Regular',creditBalance:0,walletBalance:0,status:"active",createdAt:now.toISOString(),isWalkIn:i===0}));
 const orders:Order[]=Array.from({length:12},(_,i)=>{
  const p=products.filter(p=>!p.hasVariants&&openingMovements.some(m=>m.productId===p.id&&m.quantity>=3))[i];
  const date=new Date(now.getTime()-Math.floor(i*7/12)*86400000-3600000-i*60000);
  const createdAt=date.toISOString();
  const totals=calculateTotals([{id:`seed-line-${i}`,productId:p.id,name:p.name,sku:p.sku,unitPrice:p.sellingPrice,costPrice:p.costPrice,quantity:1+(i%3),taxRate:p.taxRate,unitShortName:units.find(u=>u.id===p.unitId)!.shortName}]);
  const customer=customers[i%customers.length];
  const points=customer.isWalkIn?0:Math.floor(totals.grandTotal/100);customer.points+=points;
  return {id:`seed-order-${i}`,orderNo:formatOrderNo(i+1),branchId:i%4===3?'Branch 2':'Main Branch',customerId:customer.id,customerName:customer.name,...totals,payments:[{id:`seed-payment-${i}`,method:(['cash','gcash','maya','card','bank'] as PaymentMethod[])[i%5],amount:totals.grandTotal,createdAt}],amountPaid:totals.grandTotal,balanceDue:0,change:0,paymentStatus:'paid',orderStatus:'completed',cashier:'Demo Admin',createdAt,refundedTotal:0,pointsEarned:points};
 });
 const movements:StockMovement[]=orders.flatMap(o=>o.items.map(l=>({id:`seed-sale-${l.id}`,productId:l.productId,variantId:l.variantId,type:'out',quantity:l.quantity,reason:'Sale',reference:o.orderNo,createdAt:o.createdAt,createdBy:'Demo Admin'})));
 return {customers,orders,movements,counter:12};
}
