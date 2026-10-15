export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
}
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
