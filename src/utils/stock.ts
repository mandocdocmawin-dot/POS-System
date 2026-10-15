export function stockStatus(stock: number, reorderLevel: number) {
  return stock <= 0
    ? "Out of stock"
    : stock <= reorderLevel
      ? "Low stock"
      : "In stock";
}
