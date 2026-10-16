import {customerSchema,orderSchema,heldOrderSchema,cartItemSchema,discountSchema} from '../types/pos';
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
    customers:z.array(customerSchema).default(()=>createPosSeed().customers.map(c=>({...c,points:0}))),
    orders:z.array(orderSchema).default([]),
    heldOrders:z.array(heldOrderSchema).default([]),
    counter:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER-1).default(0),
    pos:z.object({cart:z.array(cartItemSchema),customerId:z.string(),orderDiscount:discountSchema,note:z.string().max(2000),activeOrderNo:z.string()}).default({cart:[],customerId:WALK_IN_ID,orderDiscount:{type:'fixed',value:0},note:'',activeOrderNo:'TP-000001'}),
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
  const fail = (message: string): never => {
    throw new Error(`Invalid backup: ${message}`);
  };
  for (const items of [
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
   if(paid.paymentStatus!==order.paymentStatus||(['amountPaid','balanceDue','change'] as const).some(key=>toCentavos(paid[key])!==toCentavos(order[key])))fail('payment totals are inconsistent.');
   if(order.balanceDue>0&&order.customerId===WALK_IN_ID)fail('Walk-in cannot have credit.');
   if(new Set(order.items.map(l=>l.id)).size!==order.items.length||new Set(order.payments.map(p=>p.id)).size!==order.payments.length)fail('duplicate order line or payment IDs.');
  }
  for(const held of d.heldOrders)if(!d.customers.some(c=>c.id===held.customerId))fail('held-order customer is missing.');
  if(!d.customers.some(c=>c.id===d.pos.customerId))fail('cart customer is missing.');
  if(new Set(d.pos.cart.map(l=>l.id)).size!==d.pos.cart.length)fail('duplicate cart line IDs.');
  d.pos.activeOrderNo=formatOrderNo(d.counter+1);
  return d;
}
