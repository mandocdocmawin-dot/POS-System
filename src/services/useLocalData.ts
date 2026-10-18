import {useAuthStore} from '../store/useAuthStore';
import {useStaffStore} from '../store/useStaffStore';
import {useRoleStore} from '../store/useRoleStore';
import {useAttendanceStore} from '../store/useAttendanceStore';
import {useHolidayStore} from '../store/useHolidayStore';
import {useShiftStore} from '../store/useShiftStore';
import {usePayrollStore} from '../store/usePayrollStore';
import {useRefundStore} from '../store/useRefundStore';
import {useSupplierStore} from '../store/useSupplierStore';
import {usePurchaseStore} from '../store/usePurchaseStore';
import {useWalletStore} from '../store/useWalletStore';
import {useActivityStore} from '../store/useActivityStore';
import {usePosStore} from '../store/usePosStore';
import {useOrderStore} from '../store/useOrderStore';
import {useHeldOrderStore} from '../store/useHeldOrderStore';
import {useCustomerStore} from '../store/useCustomerStore';
import {useBranchStore} from '../store/useBranchStore';
import { useSyncExternalStore } from "react";
import { useCatalogStore } from "../store/useCatalogStore";
import { useProductStore } from "../store/useProductStore";
import { useStockStore } from "../store/useStockStore";
import {useAccountStore} from '../store/useAccountStore';
import {useReportFilterStore} from '../store/useReportFilterStore';
let revision = 0;
const listeners = new Set<() => void>();
const changed = () => {
  revision++;
  listeners.forEach((fn) => fn());
};
useCatalogStore.subscribe(changed);
useAccountStore.subscribe(changed);
useReportFilterStore.subscribe(changed);
useAuthStore.subscribe(changed);
useStaffStore.subscribe(changed);
useRoleStore.subscribe(changed);
useAttendanceStore.subscribe(changed);
useHolidayStore.subscribe(changed);
useShiftStore.subscribe(changed);
usePayrollStore.subscribe(changed);

useProductStore.subscribe(changed);
useStockStore.subscribe(changed);
usePosStore.subscribe(changed);
useOrderStore.subscribe(changed);
useHeldOrderStore.subscribe(changed);
useCustomerStore.subscribe(changed);
useBranchStore.subscribe(changed);
useRefundStore.subscribe(changed);
useSupplierStore.subscribe(changed);
usePurchaseStore.subscribe(changed);
useWalletStore.subscribe(changed);
useActivityStore.subscribe(changed);

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export function useLocalData() {
  return useSyncExternalStore(subscribe, () => revision);
}
