import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Subcategory, Brand, Unit } from "../types/models";
export interface CatalogData {
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  units: Unit[];
}
export const useCatalogStore = create<CatalogData>()(
  persist<CatalogData>(
    () => ({ categories: [], subcategories: [], brands: [], units: [] }),
    { name: "tindapos:catalog", version: 1 },
  ),
);
