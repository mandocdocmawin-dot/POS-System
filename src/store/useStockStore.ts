import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StockMovement } from "../types/models";
export const useStockStore = create<{ movements: StockMovement[] }>()(
  persist<{ movements: StockMovement[] }>(() => ({ movements: [] }), {
    name: "tindapos:stock",
    version: 1,
  }),
);
