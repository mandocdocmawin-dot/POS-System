import { useCatalogStore } from "../store/useCatalogStore";
import { useProductStore } from "../store/useProductStore";
import { useStockStore } from "../store/useStockStore";
// Restore both in-memory and persisted snapshots when a browser storage write fails.
export function localTransaction<T>(write: () => T): T {
  const catalog = useCatalogStore.getState(),
    products = useProductStore.getState(),
    stock = useStockStore.getState();
  try {
    return write();
  } catch (cause) {
    for (const restore of [
      () => useCatalogStore.setState(catalog, true),
      () => useProductStore.setState(products, true),
      () => useStockStore.setState(stock, true),
    ]) {
      try {
        restore();
      } catch {
        /* Zustand restores memory before attempting the storage write. */
      }
    }
    throw new Error(
      "Unable to save data in this browser. Check available browser storage and try again.",
      { cause },
    );
  }
}
