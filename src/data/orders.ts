import type { Order } from "../types/order";
const names = [
  "Ana Santos",
  "Jose Dela Cruz",
  "Maria Reyes",
  "Carlo Garcia",
  "Bea Mendoza",
  "Paolo Ramos",
  "Liza Bautista",
];
const products = [
  "Everyday Cotton Tee",
  "Classic Canvas Shoes",
  "Minimalist Watch",
  "Everyday Tote Bag",
  "Wireless Earbuds",
  "Brewed Coffee",
  "Everyday Backpack",
];
export const orders: Order[] = Array.from({ length: 23 }, (_, i) => ({
  id: `#TP${1001 + i}`,
  date: "15 Oct, 2026",
  product: products[i % products.length],
  customer: names[i % names.length],
  items: (i % 3) + 1,
  total: [499, 1290, 1899, 350, 2290, 120, 850][i % 7],
  paymentStatus: i % 5 === 3 ? "Pending" : i % 7 === 6 ? "Failed" : "Paid",
  quantity: (i % 4) + 1,
  status: i % 5 === 3 ? "Pending" : i % 7 === 6 ? "Cancelled" : "Completed",
  method: i % 2 === 0 ? "GCash" : "Cash",
}));
