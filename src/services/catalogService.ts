import {requirePermission} from './authService';
import { localTransaction } from "./localTransaction";
import { z } from "zod";
import { useCatalogStore } from "../store/useCatalogStore";
import { useProductStore } from "../store/useProductStore";
import {
  categorySchema,
  subcategorySchema,
  brandSchema,
  unitSchema,
  type Category,
  type Subcategory,
  type Brand,
  type Unit,
} from "../types/models";
function catalog<
  T extends { id: string; name: string; status: "active" | "inactive" },
>(
  schema: z.ZodType<T>,
  list: () => T[],
  replace: (items: T[]) => void,
  inUse: (id: string) => boolean,
  validate?: (item: T) => void,
) {
  return {
    list: () => structuredClone(list()),
    save: (input: Partial<T> & { name: string }) => {requirePermission(input.id?'products:edit':'products:create');
      const current = list().find((x) => x.id === input.id);
      const item = schema.parse({
        status: "active",
        createdAt: new Date().toISOString(),
        ...current,
        ...input,
        id: current?.id ?? crypto.randomUUID(),
        slug: input.name
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-"),
      });
      if (input.id && !current)
        throw new Error("This record no longer exists.");
      if (
        list().some(
          (x) =>
            x.id !== item.id &&
            x.name.toLowerCase() === item.name.toLowerCase(),
        )
      )
        throw new Error("This name already exists.");
      validate?.(item);
      localTransaction(() =>
        replace(
          current
            ? list().map((x) => (x.id === item.id ? item : x))
            : [...list(), item],
        ),
      );
      return item;
    },
    remove: (id: string) => {requirePermission('products:delete');
      if (inUse(id))
        throw new Error("This record is in use. Deactivate it instead.");
      localTransaction(() => replace(list().filter((x) => x.id !== id)));
    },
  };
}
const products = () => useProductStore.getState().products;
export const categoryService = catalog<Category>(
  categorySchema,
  () => useCatalogStore.getState().categories,
  (categories) => useCatalogStore.setState({ categories }),
  (id) =>
    products().some((p) => p.categoryId === id) ||
    useCatalogStore.getState().subcategories.some((s) => s.categoryId === id),
);
export const subcategoryService = catalog<Subcategory>(
  subcategorySchema,
  () => useCatalogStore.getState().subcategories,
  (subcategories) => useCatalogStore.setState({ subcategories }),
  (id) => products().some((p) => p.subcategoryId === id),
  (item) => {
    if (
      !useCatalogStore
        .getState()
        .categories.some((c) => c.id === item.categoryId)
    )
      throw new Error("Choose an existing parent category.");
    if (
      products().some(
        (p) => p.subcategoryId === item.id && p.categoryId !== item.categoryId,
      )
    )
      throw new Error(
        "This subcategory is used by products in its current category.",
      );
  },
);
export const brandService = catalog<Brand>(
  brandSchema,
  () => useCatalogStore.getState().brands,
  (brands) => useCatalogStore.setState({ brands }),
  (id) => products().some((p) => p.brandId === id),
);
export const unitService = catalog<Unit>(
  unitSchema,
  () => useCatalogStore.getState().units,
  (units) => useCatalogStore.setState({ units }),
  (id) => products().some((p) => p.unitId === id),
);
