import {usePosStore} from '../store/usePosStore';
import {useOrderStore} from '../store/useOrderStore';
import {useHeldOrderStore} from '../store/useHeldOrderStore';
import {useCustomerStore} from '../store/useCustomerStore';
import {useBranchStore} from '../store/useBranchStore';
import { useSyncExternalStore } from "react";
import { useCatalogStore } from "../store/useCatalogStore";
import { useProductStore } from "../store/useProductStore";
import { useStockStore } from "../store/useStockStore";
let revision = 0;
const listeners = new Set<() => void>();
const changed = () => {
  revision++;
  listeners.forEach((fn) => fn());
};
useCatalogStore.subscribe(changed);
useProductStore.subscribe(changed);
useStockStore.subscribe(changed);
usePosStore.subscribe(changed);
useOrderStore.subscribe(changed);
useHeldOrderStore.subscribe(changed);
useCustomerStore.subscribe(changed);
useBranchStore.subscribe(changed);
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export function useLocalData() {
  return useSyncExternalStore(subscribe, () => revision);
}
