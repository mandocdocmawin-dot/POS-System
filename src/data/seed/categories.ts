import type { Category, Subcategory } from "../../types/models";
const names = [
  "Rice & Grains",
  "Canned Goods",
  "Beverages",
  "Snacks",
  "Personal Care",
  "Household",
  "Condiments",
  "Dairy & Eggs",
];
export const categories: Category[] = names.map((name, i) => ({
  id: `cat-${i}`,
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  status: "active",
  createdAt: "2025-12-19T08:00:00.000Z",
}));
const children = [
  ["Rice", "Noodles"],
  ["Fish", "Meat"],
  ["Coffee", "Soft Drinks"],
  ["Biscuits", "Chips"],
  ["Soap", "Shampoo"],
  ["Laundry", "Cleaning"],
  ["Sauces", "Seasoning"],
  ["Milk", "Eggs"],
];
export const subcategories: Subcategory[] = children.flatMap((names, i) =>
  names.map((name, j) => ({
    id: `sub-${i}-${j}`,
    categoryId: `cat-${i}`,
    name,
    status: "active",
    createdAt: "2025-12-19T08:00:00.000Z",
  })),
);
