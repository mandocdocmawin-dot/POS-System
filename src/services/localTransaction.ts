import {useRefundStore} from '../store/useRefundStore';
import {useSupplierStore} from '../store/useSupplierStore';
import {usePurchaseStore} from '../store/usePurchaseStore';
import {useWalletStore} from '../store/useWalletStore';
import {useActivityStore} from '../store/useActivityStore';
import {usePosStore} from '../store/usePosStore';
import {useOrderStore} from '../store/useOrderStore';
import {useHeldOrderStore} from '../store/useHeldOrderStore';
import {useCustomerStore} from '../store/useCustomerStore';
import { useCatalogStore } from "../store/useCatalogStore";
import { useProductStore } from "../store/useProductStore";
import { useStockStore } from "../store/useStockStore";
// Restore both in-memory and persisted snapshots when a browser storage write fails.
export function localTransaction<T>(write: () => T): T {
  const catalog = useCatalogStore.getState(),
    products = useProductStore.getState(),
    stock = useStockStore.getState();
  const pos = usePosStore.getState();
  const order = useOrderStore.getState();
  const heldorder = useHeldOrderStore.getState();
  const customer = useCustomerStore.getState();
  const restores = [(()=>{const snapshot=useRefundStore.getState();return ()=>useRefundStore.setState(snapshot,true);})(),(()=>{const snapshot=useSupplierStore.getState();return ()=>useSupplierStore.setState(snapshot,true);})(),(()=>{const snapshot=usePurchaseStore.getState();return ()=>usePurchaseStore.setState(snapshot,true);})(),(()=>{const snapshot=useWalletStore.getState();return ()=>useWalletStore.setState(snapshot,true);})(),(()=>{const snapshot=useActivityStore.getState();return ()=>useActivityStore.setState(snapshot,true);})()];
  try {
    return write();
  } catch (cause) {
    for (const restore of [
      ...restores,
      () => usePosStore.setState(pos, true),
      () => useOrderStore.setState(order, true),
      () => useHeldOrderStore.setState(heldorder, true),
      () => useCustomerStore.setState(customer, true),
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
      cause instanceof Error ? cause.message : "Unable to save data in this browser. Check available browser storage and try again.",
      { cause },
    );
  }
}
