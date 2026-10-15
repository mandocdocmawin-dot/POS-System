export interface LegacyProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
}
export type { Product, Variant } from './models';
export interface ProductCategory {
  name: string;
  icon:
    | "all"
    | "clothing"
    | "footwear"
    | "watches"
    | "food"
    | "accessories"
    | "electronics"
    | "bags";
}
