import { z } from 'zod';
const money = z.number().finite().nonnegative();
const id = z.string().min(1);
export const discountSchema = z.object({type:z.enum(['percent','fixed']),value:money});
export const customerSchema = z.object({id,name:z.string().trim().min(1).max(120),phone:z.string().trim().max(40).optional(),email:z.email().optional(),points:z.number().int().nonnegative(),tier:z.enum(['Regular','Silver','Gold','Platinum']),creditBalance:money,walletBalance:money.default(0),status:z.enum(["active","inactive"]).default("active"),address:z.string().optional(),notes:z.string().optional(),createdAt:z.iso.datetime(),isWalkIn:z.boolean().optional()});
export const cartItemSchema = z.object({id,productId:id,variantId:id.optional(),name:z.string().min(1),sku:id,unitPrice:money,costPrice:money,quantity:z.number().finite().positive(),taxRate:z.union([z.literal(0),z.literal(12)]),unitShortName:z.string(),variantName:z.string().optional(),imageId:z.string().optional(),discountType:z.enum(['percent','fixed']).optional(),discountValue:money.optional()});
export const orderLineSchema = cartItemSchema.extend({lineSubtotal:money,lineDiscount:money,orderDiscountAmount:money,lineTax:money,lineTotal:money});
export const paymentSchema = z.object({id,method:z.enum(['cash','gcash','maya','card','bank','wallet']),amount:money,reference:z.string().max(120).optional(),createdAt:z.iso.datetime()});
export const orderSchema = z.object({id,orderNo:z.string().regex(/^TP-\d{6,}$/),branchId:id,customerId:id,customerName:z.string(),items:z.array(orderLineSchema).min(1),subtotal:money,itemDiscountTotal:money,orderDiscount:discountSchema.extend({amount:money}),taxTotal:money,grandTotal:money,payments:z.array(paymentSchema),amountPaid:money,balanceDue:money,change:money,paymentStatus:z.enum(['paid','partial','unpaid']),orderStatus:z.enum(['completed','pending','cancelled','refunded','partially_refunded']),note:z.string().optional(),dueDate:z.iso.date().optional(),cashier:z.string().min(1),createdAt:z.iso.datetime(),refundedTotal:money.default(0),cancelledAt:z.iso.datetime().optional(),cancelReason:z.string().optional(),pointsEarned:z.number().int().nonnegative()});
export const heldOrderSchema=z.object({id,label:z.string().min(1),cart:z.array(cartItemSchema).min(1),customerId:id,orderDiscount:discountSchema.optional(),note:z.string().optional(),createdAt:z.iso.datetime()});
export type Customer=z.infer<typeof customerSchema>;
export type Discount=z.infer<typeof discountSchema>;
export type CartItem=z.infer<typeof cartItemSchema>;
export type OrderLine=z.infer<typeof orderLineSchema>;
export type Payment=z.infer<typeof paymentSchema>;
export type PaymentMethod=Payment['method'];
export type Order=z.infer<typeof orderSchema>;
export type HeldOrder=z.infer<typeof heldOrderSchema>;
export interface Totals {items:OrderLine[];subtotal:number;itemDiscountTotal:number;orderDiscount:Discount & {amount:number};taxTotal:number;grandTotal:number}
