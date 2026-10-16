import {requirePermission} from './authService';
import {useOrderStore} from '../store/useOrderStore';
import { localTransaction } from "./localTransaction";
import {
  productSchema,
  variantSchema,
  type Product,
  type Variant,
  type StockMovement,
} from "../types/models";
import { useProductStore } from "../store/useProductStore";
import { useStockStore } from "../store/useStockStore";
import { useCatalogStore } from "../store/useCatalogStore";
export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
};
export type VariantInput = Omit<Variant, "id" | "productId"> & { id?: string };
function validateSKU(products: Product[], variants: Variant[]) {
  const ids = [...products, ...variants].map((x) => x.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("Product and variant IDs must be unique.");
  const skus = [...products, ...variants].map((p) =>
    p.sku.trim().toLowerCase(),
  );
  if (new Set(skus).size !== skus.length)
    throw new Error("SKU must be unique across all products and variants.");
}
function validateClassification(p: Product) {
  const c = useCatalogStore.getState();
  if (
    !c.categories.some((x) => x.id === p.categoryId) ||
    !c.units.some((x) => x.id === p.unitId)
  )
    throw new Error("Choose an existing category and unit.");
  if (p.brandId && !c.brands.some((x) => x.id === p.brandId))
    throw new Error("Brand does not exist.");
  if (
    p.subcategoryId &&
    !c.subcategories.some(
      (x) => x.id === p.subcategoryId && x.categoryId === p.categoryId,
    )
  )
    throw new Error("Subcategory must belong to the selected category.");
}
export const productService = {
  list: () => structuredClone(useProductStore.getState().products),
  get: (id: string) =>
    structuredClone(
      useProductStore.getState().products.find((p) => p.id === id),
    ),
  variants: (productId?: string) =>
    structuredClone(
      useProductStore
        .getState()
        .variants.filter((v) => !productId || v.productId === productId),
    ),
  save: (
    input: ProductInput,
    options: {
      variants?: VariantInput[];
      openingStock?: number;
      variantOpening?: Record<string, number>;
    } = {},
  ) => {
    requirePermission(input.id?'products:edit':'products:create');
    const state = useProductStore.getState();
    const current = state.products.find((p) => p.id === input.id);
    if (input.id && !current) throw new Error("Product no longer exists.");
    const now = new Date().toISOString();
    const p = productSchema.parse({
      createdAt: now,
      ...current,
      ...input,
      id: current?.id ?? crypto.randomUUID(),
      updatedAt: now,
    });
    validateClassification(p);
    const existing = state.variants.filter((v) => v.productId === p.id);
    const variants = options.variants
      ? options.variants.map((v) =>
          variantSchema.parse({
            ...v,
            id: v.id || crypto.randomUUID(),
            productId: p.id,
          }),
        )
      : existing;
    if (
      variants.some((v) =>
        state.variants.some((x) => x.id === v.id && x.productId !== p.id),
      )
    )
      throw new Error("Invalid variant ownership.");
    if (p.hasVariants !== variants.length > 0)
      throw new Error(
        "Products with variants need at least one variant; disable variants to save a simple product.",
      );
    const movements = useStockStore.getState().movements;
    if (
      current &&
      current.hasVariants !== p.hasVariants &&
      movements.some((m) => m.productId === p.id)
    )
      throw new Error(
        "Cannot change stock tracking mode after movements exist. Create a separate product.",
      );
    if (
      existing.some(
        (v) =>
          !variants.some((x) => x.id === v.id) &&
          movements.some((m) => m.variantId === v.id),
      )
    )
      throw new Error("Cannot remove a variant with stock history.");
    const nextProducts = current
      ? state.products.map((x) => (x.id === p.id ? p : x))
      : [...state.products, p];
    const nextVariants = [
      ...state.variants.filter((v) => v.productId !== p.id),
      ...variants,
    ];
    validateSKU(nextProducts, nextVariants);
    const opening = options.openingStock ?? 0;
    if (!Number.isFinite(opening) || opening < 0)
      throw new Error("Opening stock must be nonnegative.");
    const initial: StockMovement[] = [];
    if (!current)
      for (const item of p.hasVariants
        ? variants.map((v) => ({
            variantId: v.id,
            quantity: options.variantOpening?.[v.sku] ?? 0,
          }))
        : [{ variantId: undefined, quantity: opening }]) {
        if (!Number.isFinite(item.quantity) || item.quantity < 0)
          throw new Error("Opening stock must be nonnegative.");
        if (item.quantity > 0)
          initial.push({
            id: crypto.randomUUID(),
            productId: p.id,
            ...item,
            type: "initial",
            reason: "Opening stock",
            createdAt: now,
            createdBy: "Demo Admin",
          });
      }
    localTransaction(() => {
      useProductStore.setState({
        products: nextProducts,
        variants: nextVariants,
      });
      if (initial.length)
        useStockStore.setState({ movements: [...movements, ...initial] });
    });
    return p;
  },
  removeMany: (ids: string[]) => {requirePermission('products:delete');
    if(useOrderStore.getState().orders.some(o=>o.items.some(l=>ids.includes(l.productId))))
      throw new Error('Sold products cannot be deleted. Set their status to inactive instead.');
    return localTransaction(() => {
      useProductStore.setState((s) => ({
        products: s.products.filter((p) => !ids.includes(p.id)),
        variants: s.variants.filter((v) => !ids.includes(v.productId)),
      }));
      useStockStore.setState((s) => ({
        movements: s.movements.filter((m) => !ids.includes(m.productId)),
      }));
    });
  },
  saveVariant: (productId: string, input: VariantInput) => {requirePermission('products:edit');
    const product = productService.get(productId);
    if (!product) throw new Error("Product not found.");
    const current = productService.variants(productId);
    if (input.id && !current.some((v) => v.id === input.id))
      throw new Error("Variant not found.");
    const variant = variantSchema.parse({
      ...input,
      id: input.id || crypto.randomUUID(),
      productId,
    });
    productService.save(
      { ...product, hasVariants: true },
      {
        variants: input.id
          ? current.map((v) => (v.id === input.id ? variant : v))
          : [...current, variant],
      },
    );
    return variant;
  },
  removeVariant: (id: string) => {requirePermission('products:delete');
    const v = useProductStore.getState().variants.find((x) => x.id === id);
    if (!v) throw new Error("Variant not found.");
    const p = productService.get(v.productId)!;
    const variants = productService.variants(p.id).filter((x) => x.id !== id);
    productService.save(
      { ...p, hasVariants: variants.length > 0 },
      { variants },
    );
  },
};
