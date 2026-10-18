import {approvalService} from './approvalService';
import {authService} from './authService';
import {requirePermission} from './authService';
import { localTransaction } from "./localTransaction";
import { movementSchema, type StockMovement } from "../types/models";
import { useStockStore } from "../store/useStockStore";
import { productService } from "./productService";
import { categoryService } from "./categoryService";
export const movementDelta = (m: Pick<StockMovement, "type" | "quantity">) =>
  m.type === "out" ? -m.quantity : m.quantity;
export const stockService = {
  getStock: (productId: string, variantId?: string): number =>
    Math.round(
      useStockStore
        .getState()
        .movements.filter(
          (m) =>
            m.productId === productId &&
            (!variantId || m.variantId === variantId),
        )
        .reduce((sum, m) => sum + movementDelta(m), 0) * 1e8,
    ) / 1e8,
  history: (productId?: string, variantId?: string) =>
    structuredClone(
      useStockStore
        .getState()
        .movements.filter(
          (m) =>
            (!productId || m.productId === productId) &&
            (!variantId || m.variantId === variantId),
        )
        .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt)),
    ),
  record: (input: Omit<StockMovement, "id" | "createdBy">) => {requirePermission(input.reason==='Sale'?'pos:use':input.reason==='Order cancelled'?'orders:cancel':input.reason==='Customer return'?'orders:refund':['Purchase','Supplier return'].includes(input.reason)?'purchases:create':'inventory:adjust');
    const m = movementSchema.parse({
      ...input,
      id: crypto.randomUUID(),
      createdBy: authService.getCurrentUser()?.name??'System',
    });
    const p = productService.get(m.productId);
    if (!p) throw new Error("Choose an existing product.");
    if (p.hasVariants && !m.variantId)
      throw new Error("Choose a specific variant.");
    if (
      m.variantId &&
      !productService.variants(p.id).some((v) => v.id === m.variantId)
    )
      throw new Error("Variant does not belong to this product.");
    if (m.type === "initial")
      throw new Error(
        "Opening stock can only be recorded when creating a product.",
      );
    if (
      stockService.getStock(m.productId, m.variantId) + movementDelta(m) <
      -1e-8
    )
      throw new Error("Insufficient stock. Stock cannot become negative.");
    if (m.type === "adjustment" && m.quantity === 0)
      throw new Error(
        "Counted stock matches current stock; no adjustment is needed.",
      );
    localTransaction(() => {
      if(m.type==='adjustment')approvalService.ensure('adjustment',m.quantity,JSON.stringify(['adjustment',input]));
      useStockStore.setState((s) => ({ movements: [...s.movements, m] }));
    });
    return m;
  },
  items: () => {
    const categories = categoryService.list();
    return productService.list().flatMap((p) =>
      (p.hasVariants ? productService.variants(p.id) : [undefined]).map(
        (v) => ({
          key: v?.id ?? p.id,
          product: p,
          variant: v,
          name: p.name + (v ? ` / ${v.name}` : ""),
          sku: v?.sku ?? p.sku,
          stock: stockService.getStock(p.id, v?.id),
          cost: v?.costPrice ?? p.costPrice,
          category: categories.find((c) => c.id === p.categoryId)?.name ?? "—",
        }),
      ),
    );
  },
};
