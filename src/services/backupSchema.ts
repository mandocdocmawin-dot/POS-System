import {staffBackupSchema,validateStaffBackup} from './staffBackup';
import {migratePhase6Roles} from '../config/permissions';
import {createPhase5Seed} from '../data/seed/phase5';
import {refundSchema,supplierSchema,purchaseSchema,purchaseReturnSchema,supplierPaymentSchema,walletTransactionSchema,customerPaymentSchema,activitySchema} from '../types/phase4';
import {purchaseBalance} from '../utils/supplierBalance';
import {purchaseTotals} from './purchaseService';
import {refundLine} from '../utils/refund';
import {multiplyCentavos} from '../utils/pos';
import {customerSchema,orderSchema,heldOrderSchema,cartItemSchema,discountSchema,discountApprovalSchema} from '../types/pos';
import {WALK_IN_ID} from '../config/pos';
import {createPosSeed} from '../data/seed/pos';
import {calculatePayments,calculateTotals,toCentavos} from '../utils/pos';
import {formatOrderNo} from '../utils/orderNo';
import { z } from "zod";
import {
  categorySchema,
  subcategorySchema,
  brandSchema,
  unitSchema,
  productSchema,
  variantSchema,
  movementSchema,
} from "../types/models";
export const backupSchema = z
  .object({
    version: z.literal(1),
    phase5:staffBackupSchema.default(()=>({...createPhase5Seed(),auth:{currentUserId:null}})),
    refunds:z.array(refundSchema).default([]),refundCounter:z.number().int().nonnegative().default(0),
    suppliers:z.array(supplierSchema).default([]),purchases:z.array(purchaseSchema).default([]),purchaseReturns:z.array(purchaseReturnSchema).default([]),supplierPayments:z.array(supplierPaymentSchema).default([]),purchaseCounter:z.number().int().nonnegative().default(0),returnCounter:z.number().int().nonnegative().default(0),
    walletTransactions:z.array(walletTransactionSchema).default([]),customerPayments:z.array(customerPaymentSchema).default([]),activityLogs:z.array(activitySchema).default([]),
    customers:z.array(customerSchema).default(()=>createPosSeed().customers.map(c=>({...c,points:0}))),
    orders:z.array(orderSchema).default([]),
    heldOrders:z.array(heldOrderSchema).default([]),
    counter:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER-1).default(0),
    pos:z.object({cart:z.array(cartItemSchema),customerId:z.string(),orderDiscount:discountSchema,note:z.string().max(2000),activeOrderNo:z.string(),discountApproval:discountApprovalSchema.optional()}).default({cart:[],customerId:WALK_IN_ID,orderDiscount:{type:'fixed',value:0},note:'',activeOrderNo:'TP-000001'}),
    categories: z.array(categorySchema),
    subcategories: z.array(subcategorySchema),
    brands: z.array(brandSchema),
    units: z.array(unitSchema),
    products: z.array(productSchema),
    variants: z.array(variantSchema),
    movements: z.array(movementSchema),
    images: z
      .record(
        z.string(),
        z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/),
      )
      .optional(),
  })
  .strict();
export type Backup = z.infer<typeof backupSchema>;
export function validateBackup(input: unknown): Backup {
  const d = backupSchema.parse(input);
  d.phase5.roles=migratePhase6Roles(d.phase5.roles);
  validateStaffBackup(d.phase5);
  const fail = (message: string): never => {
    throw new Error(`Invalid backup: ${message}`);
  };
  for (const items of [
    d.refunds,d.suppliers,d.purchases,d.purchaseReturns,d.supplierPayments,d.walletTransactions,d.customerPayments,d.activityLogs,
    d.customers,d.orders,d.heldOrders,
    d.categories,
    d.subcategories,
    d.brands,
    d.units,
    d.products,
    d.variants,
    d.movements,
  ])
    if (new Set(items.map((x) => x.id)).size !== items.length)
      fail("duplicate record IDs.");
  if (
    new Set([...d.products, ...d.variants].map((x) => x.id)).size !==
    d.products.length + d.variants.length
  )
    fail("product and variant IDs overlap.");
  const skus = [...d.products, ...d.variants].map((p) => p.sku.toLowerCase());
  if (new Set(skus).size !== skus.length) fail("duplicate SKUs.");
  for (const s of d.subcategories)
    if (!d.categories.some((c) => c.id === s.categoryId))
      fail("subcategory parent is missing.");
  for (const p of d.products) {
    if (
      !d.categories.some((c) => c.id === p.categoryId) ||
      !d.units.some((u) => u.id === p.unitId)
    )
      fail("product category or unit is missing.");
    if (p.brandId && !d.brands.some((b) => b.id === p.brandId))
      fail("product brand is missing.");
    if (
      p.subcategoryId &&
      !d.subcategories.some(
        (s) => s.id === p.subcategoryId && s.categoryId === p.categoryId,
      )
    )
      fail("subcategory does not match product category.");
    if (p.hasVariants !== d.variants.some((v) => v.productId === p.id))
      fail("variant tracking does not match product.");
  }
  for (const v of d.variants)
    if (!d.products.some((p) => p.id === v.productId))
      fail("variant product is missing.");
  const balances = new Map<string, number>();
  for (const m of d.movements) {
    const p = d.products.find((p) => p.id === m.productId);
    if (!p) fail("movement product is missing.");
    if (p!.hasVariants !== !!m.variantId)
      fail("movement must match product tracking mode.");
    if (
      m.variantId &&
      !d.variants.some(
        (v) => v.id === m.variantId && v.productId === m.productId,
      )
    )
      fail("movement variant is invalid.");
    const key = m.variantId ?? m.productId;
    balances.set(
      key,
      (balances.get(key) ?? 0) + (m.type === "out" ? -m.quantity : m.quantity),
    );
  }
  if ([...balances.values()].some((v) => v < -1e-8))
    fail("stock would become negative.");
  const walkIns=d.customers.filter(c=>c.isWalkIn);
  if(walkIns.length!==1||walkIns[0].id!==WALK_IN_ID||walkIns[0].name!=='Walk-in Customer'||walkIns[0].creditBalance!==0)fail('Walk-in customer must be preserved.');
  if(new Set(d.orders.map(o=>o.orderNo)).size!==d.orders.length)fail('duplicate order numbers.');
  if(d.orders.some(o=>Number(o.orderNo.slice(3))>d.counter))fail('order counter would reuse a saved number.');
  for(const order of d.orders){
   if(!d.customers.some(c=>c.id===order.customerId))fail('order customer is missing.');
   const totals=calculateTotals(order.items,order.orderDiscount);
   for(const key of ['subtotal','itemDiscountTotal','taxTotal','grandTotal'] as const)if(toCentavos(order[key])!==toCentavos(totals[key]))fail('order totals are inconsistent.');
   if(toCentavos(order.orderDiscount.amount)!==toCentavos(totals.orderDiscount.amount))fail('order discount amount is inconsistent.');
   order.items.forEach((line,i)=>{for(const key of ['lineSubtotal','lineDiscount','orderDiscountAmount','lineTax','lineTotal'] as const)if(toCentavos(line[key])!==toCentavos(totals.items[i][key]))fail('order line totals are inconsistent.');});
   const paid=calculatePayments(order.grandTotal,order.payments);
   if(paid.paymentStatus!==order.paymentStatus||(['amountPaid','balanceDue','change'] as const).some(key=>(key!=='balanceDue'||order.orderStatus!=='cancelled')&&toCentavos(paid[key])!==toCentavos(order[key])))fail('payment totals are inconsistent.');
   if(order.balanceDue>0&&order.customerId===WALK_IN_ID)fail('Walk-in cannot have credit.');
   if(new Set(order.items.map(l=>l.id)).size!==order.items.length||new Set(order.payments.map(p=>p.id)).size!==order.payments.length)fail('duplicate order line or payment IDs.');
  }
  for(const held of d.heldOrders)if(!d.customers.some(c=>c.id===held.customerId))fail('held-order customer is missing.');
  if(!d.customers.some(c=>c.id===d.pos.customerId))fail('cart customer is missing.');
  if(new Set(d.pos.cart.map(l=>l.id)).size!==d.pos.cart.length)fail('duplicate cart line IDs.');
  const cent=toCentavos;
  for(const [rows,counter,prefix] of [[d.refunds,d.refundCounter,'refundNo'],[d.purchases,d.purchaseCounter,'purchaseNo'],[d.purchaseReturns,d.returnCounter,'returnNo']] as const){
   const numbers=rows.map(r=>('refundNo' in r?r.refundNo:'purchaseNo' in r?r.purchaseNo:r.returnNo));
   if(new Set(numbers).size!==numbers.length||numbers.some(n=>Number(n.slice(3))>counter))fail(`${prefix} counter or duplicate number.`);
  }
  for(const o of d.orders){const refunds=d.refunds.filter(r=>r.orderId===o.id);const refunded=refunds.reduce((n,r)=>n+cent(r.refundAmount),0);if(refunded!==cent(o.refundedTotal)||refunded>cent(o.amountPaid))fail('refund total is inconsistent.');const history:typeof refunds[number]['items']=[];for(const r of refunds){if(r.refundMethod==='wallet'&&o.customerId===WALK_IN_ID)fail('Walk-in wallet refund.');if(new Set(r.items.map(l=>l.orderLineId)).size!==r.items.length)fail('duplicate refund line.');for(const l of r.items){const line=o.items.find(x=>x.id===l.orderLineId);if(!line||line.productId!==l.productId||line.variantId!==l.variantId)fail('refund line reference.');const expected=refundLine(line!,l.quantity,history);if(cent(expected.lineRefund)!==cent(l.lineRefund))fail('refund line allocation.');history.push(l);}if(r.items.length&&r.items.reduce((n,l)=>n+cent(l.lineRefund),0)!==cent(r.refundAmount))fail('refund amount.');if(!r.items.length&&o.orderStatus!=='cancelled')fail('empty refund requires cancellation.');}}
  if(d.refunds.some(r=>!d.orders.some(o=>o.id===r.orderId)))fail('refund order is missing.');
  for(const payment of d.customerPayments){const o=d.orders.find(o=>o.id===payment.orderId);if(!o||o.customerId!==payment.customerId||!o.payments.some(p=>p.id===payment.id&&cent(p.amount)===cent(payment.amount)&&p.method===payment.method))fail('customer payment reference.');}
  const walletBalances=new Map<string,number>();
  for(const t of d.walletTransactions){if(t.customerId===WALK_IN_ID||!d.customers.some(c=>c.id===t.customerId))fail('wallet customer is invalid.');if(t.orderId&&!d.orders.some(o=>o.id===t.orderId&&o.customerId===t.customerId))fail('wallet order is invalid.');if(!t.amount||(t.type==='spend'&&t.amount>=0)||(['topup','refund'].includes(t.type)&&t.amount<=0)||(t.type==='adjustment'&&!t.note?.trim()))fail('wallet transaction sign or reason.');const balance=(walletBalances.get(t.customerId)??0)+Math.sign(t.amount)*cent(Math.abs(t.amount));if(balance<0||balance!==cent(t.balanceAfter))fail('wallet balanceAfter is inconsistent.');walletBalances.set(t.customerId,balance);}
  for(const customer of d.customers){if(cent(customer.walletBalance)!==(walletBalances.get(customer.id)??0))fail('customer wallet ledger differs from balance.');const debt=d.orders.filter(o=>o.customerId===customer.id&&o.orderStatus!=='cancelled').reduce((n,o)=>n+cent(o.balanceDue),0);if(debt!==cent(customer.creditBalance))fail('customer credit differs from order balances.');}
  for(const po of d.purchases){if(!d.suppliers.some(s=>s.id===po.supplierId))fail('purchase supplier missing.');if(new Set(po.items.map(l=>l.id)).size!==po.items.length||new Set(po.items.map(l=>l.variantId??l.productId)).size!==po.items.length)fail('duplicate purchase line.');const totals=purchaseTotals(po);for(const key of ['subtotal','taxTotal','grandTotal'] as const)if(cent(po[key])!==cent(totals[key]))fail('purchase totals.');for(const [i,l] of po.items.entries()){if(l.receivedQty>l.orderedQty||cent(l.lineTotal)!==cent(totals.items[i].lineTotal))fail('purchase line totals or receiving quantity.');const product=d.products.find(p=>p.id===l.productId);if(!product||product.hasVariants!==!!l.variantId||l.variantId&&!d.variants.some(v=>v.id===l.variantId&&v.productId===l.productId))fail('purchase product reference.');const returned=d.purchaseReturns.filter(r=>r.purchaseId===po.id).flatMap(r=>r.items).filter(r=>r.purchaseLineId===l.id).reduce((n,l)=>n+l.quantity,0);if(returned>l.receivedQty+1e-8)fail('purchase return quantity.');}const balance=purchaseBalance(po,d.purchaseReturns,d.supplierPayments);if(po.receiveStatus==='cancelled'){if(po.items.some(l=>l.receivedQty)||po.amountPaid||po.balanceDue)fail('cancelled purchase has receipts or payments.');}else if(cent(balance.balanceDue)!==cent(po.balanceDue)||cent(balance.amountPaid)!==cent(po.amountPaid)||balance.paymentStatus!==po.paymentStatus)fail('purchase balance.');}
  for(const r of d.purchaseReturns){const po=d.purchases.find(p=>p.id===r.purchaseId);if(!po||po.supplierId!==r.supplierId)fail('return purchase or supplier reference.');let total=0;for(const line of r.items){const l=po!.items.find(l=>l.id===line.purchaseLineId);if(!l||cent(l.unitCost)!==cent(line.unitCost))fail('return line reference.');total+=multiplyCentavos(cent(line.unitCost),line.quantity);}if(total!==cent(r.creditAmount))fail('return credit amount.');}
  for(const pay of d.supplierPayments){const po=d.purchases.find(p=>p.id===pay.purchaseId);if(!po||po.supplierId!==pay.supplierId||pay.method==='wallet'||pay.amount<=0)fail('supplier payment reference.');}
  d.pos.activeOrderNo=formatOrderNo(d.counter+1);
  return d;
}
