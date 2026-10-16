import { z } from "zod";

export const statusSchema = z.enum(["active", "inactive"]);
const id = z.string().min(1);
const money = z.number().finite().nonnegative();
const timestamp = z.iso.datetime();
export const categorySchema = z.object({
  id,
  name: z.string().trim().min(1),
  slug: z.string().min(1),
  status: statusSchema,
  createdAt: timestamp,
});
export const subcategorySchema = z.object({
  id,
  categoryId: id,
  name: z.string().trim().min(1),
  status: statusSchema,
  createdAt: timestamp,
});
export const brandSchema = z.object({
  id,
  name: z.string().trim().min(1),
  status: statusSchema,
  createdAt: timestamp,
});
export const unitSchema = z.object({
  id,
  name: z.string().trim().min(1),
  shortName: z.string().trim().min(1),
  status: statusSchema,
});
export const productSchema = z.object({
  id,
  name: z.string().trim().min(1),
  sku: z.string().trim().min(1),
  barcode: z.string().optional(),
  categoryId: id,
  subcategoryId: z.string().optional(),
  brandId: z.string().optional(),
  unitId: id,
  costPrice: money,
  sellingPrice: money,
  taxRate: z.union([z.literal(0), z.literal(12)]),
  discountPercent: z.number().min(0).max(100).optional(),
  reorderLevel: money,
  description: z.string().optional(),
  imageId: z.string().optional(),
  hasVariants: z.boolean(),
  status: statusSchema,
  createdAt: timestamp,
  updatedAt: timestamp,
});
export const variantSchema = z.object({
  id,
  productId: id,
  name: z.string().trim().min(1),
  sku: z.string().trim().min(1),
  barcode: z.string().optional(),
  costPrice: money,
  sellingPrice: money,
  attributes: z.record(z.string(), z.string()),
});
export const movementSchema = z
  .object({
    id,
    productId: id,
    variantId: z.string().optional(),
    type: z.enum(["in", "out", "adjustment", "initial"]),
    quantity: z.number().finite(),
    reason: z.string().trim().min(1),
    reference: z.string().optional(),
    note: z.string().optional(),
    createdAt: timestamp,
    createdBy: z.string().min(1),
  })
  .refine(
    (m) => m.type === "adjustment" || m.quantity > 0,
    "Quantity must be positive",
  );
export type Category = z.infer<typeof categorySchema>;
export type Subcategory = z.infer<typeof subcategorySchema>;
export type Brand = z.infer<typeof brandSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type Product = z.infer<typeof productSchema>;
export type Variant = z.infer<typeof variantSchema>;
export type StockMovement = z.infer<typeof movementSchema>;
