import type { StockMovement } from "../../types/models";
import { products, variants } from "./products";
export const movements: StockMovement[] = products.flatMap((p, i) =>
  (p.hasVariants
    ? variants
        .filter((v) => v.productId === p.id)
        .map((v, j) => ({ variantId: v.id, quantity: i === 11 ? 3 : 20 + j }))
    : [
        {
          variantId: undefined,
          quantity: i % 7 === 0 ? 0 : i % 4 === 0 ? 4 : 30 + i,
        },
      ]
  )
    .filter((item) => item.quantity > 0)
    .map((item) => ({
      id: `initial-${item.variantId ?? p.id}`,
      productId: p.id,
      ...item,
      type: "initial",
      reason: "Demo opening stock",
      createdAt: "2025-12-19T08:00:00.000Z",
      createdBy: "Demo Admin",
    })),
);
