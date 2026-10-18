import { storageOptions } from '../core/storage/options';
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, Variant } from "../types/models";
export const useProductStore = create<{
  products: Product[];
  variants: Variant[];
}>()(
  persist<{ products: Product[]; variants: Variant[] }>(
    () => ({ products: [], variants: [] }),
    { name: "tindapos:products", ...storageOptions<{
  products: Product[];
  variants: Variant[];
}>('tindapos:products'), version: 1 },
  ),
);
