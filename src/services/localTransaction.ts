import {useCalendarStore} from '../store/useCalendarStore';
import {useNotificationStore} from '../store/useNotificationStore';
import {useChatStore} from '../store/useChatStore';
import {useEmailStore} from '../store/useEmailStore';
import {useTicketStore} from '../store/useTicketStore';
import {useContentStore} from '../store/useContentStore';
import {useDocumentStore} from '../store/useDocumentStore';
import {useNoteStore} from '../store/useNoteStore';
import {useGuideStore} from '../store/useGuideStore';
import {useErrorLogStore} from '../store/useErrorLogStore';
import {useMetaStore} from '../store/useMetaStore';
import { beginStorageBatch, commitStorageBatch, abortStorageBatch } from '../core/storage';
import {useThemeStore} from '../store/useThemeStore';
import {useBranchStore} from '../store/useBranchStore';
import {useTransferStore} from '../store/useTransferStore';
import {useBranchesStore} from '../store/useBranchesStore';
import {useCouponStore} from '../store/useCouponStore';
import {useSettingsStore} from '../store/useSettingsStore';
import {useAccountStore} from '../store/useAccountStore';
import {useReportFilterStore} from '../store/useReportFilterStore';
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
  const accounts=useAccountStore.getState(), reportFilters=useReportFilterStore.getState();
  const restores = [(()=>{const snapshot=useCalendarStore.getState();return ()=>useCalendarStore.setState(snapshot,true);})(),(()=>{const snapshot=useNotificationStore.getState();return ()=>useNotificationStore.setState(snapshot,true);})(),(()=>{const snapshot=useChatStore.getState();return ()=>useChatStore.setState(snapshot,true);})(),(()=>{const snapshot=useEmailStore.getState();return ()=>useEmailStore.setState(snapshot,true);})(),(()=>{const snapshot=useTicketStore.getState();return ()=>useTicketStore.setState(snapshot,true);})(),(()=>{const snapshot=useContentStore.getState();return ()=>useContentStore.setState(snapshot,true);})(),(()=>{const snapshot=useDocumentStore.getState();return ()=>useDocumentStore.setState(snapshot,true);})(),(()=>{const snapshot=useNoteStore.getState();return ()=>useNoteStore.setState(snapshot,true);})(),(()=>{const snapshot=useGuideStore.getState();return ()=>useGuideStore.setState(snapshot,true);})(),(()=>{const snapshot=useErrorLogStore.getState();return ()=>useErrorLogStore.setState(snapshot,true);})(),(()=>{const snapshot=useMetaStore.getState();return ()=>useMetaStore.setState(snapshot,true);})(),(()=>{const snapshot=useThemeStore.getState();return ()=>useThemeStore.setState(snapshot,true);})(),(()=>{const snapshot=useBranchStore.getState();return ()=>useBranchStore.setState(snapshot,true);})(),(()=>{const snapshot=useTransferStore.getState();return ()=>useTransferStore.setState(snapshot,true);})(),(()=>{const snapshot=useBranchesStore.getState();return ()=>useBranchesStore.setState(snapshot,true);})(),(()=>{const snapshot=useCouponStore.getState();return ()=>useCouponStore.setState(snapshot,true);})(),(()=>{const snapshot=useSettingsStore.getState();return ()=>useSettingsStore.setState(snapshot,true);})(),(()=>{const snapshot=useAuthStore.getState();return ()=>useAuthStore.setState(snapshot,true);})(),(()=>{const snapshot=useStaffStore.getState();return ()=>useStaffStore.setState(snapshot,true);})(),(()=>{const snapshot=useRoleStore.getState();return ()=>useRoleStore.setState(snapshot,true);})(),(()=>{const snapshot=useAttendanceStore.getState();return ()=>useAttendanceStore.setState(snapshot,true);})(),(()=>{const snapshot=useHolidayStore.getState();return ()=>useHolidayStore.setState(snapshot,true);})(),(()=>{const snapshot=useShiftStore.getState();return ()=>useShiftStore.setState(snapshot,true);})(),(()=>{const snapshot=usePayrollStore.getState();return ()=>usePayrollStore.setState(snapshot,true);})(),(()=>{const snapshot=useRefundStore.getState();return ()=>useRefundStore.setState(snapshot,true);})(),(()=>{const snapshot=useSupplierStore.getState();return ()=>useSupplierStore.setState(snapshot,true);})(),(()=>{const snapshot=usePurchaseStore.getState();return ()=>usePurchaseStore.setState(snapshot,true);})(),(()=>{const snapshot=useWalletStore.getState();return ()=>useWalletStore.setState(snapshot,true);})(),(()=>{const snapshot=useActivityStore.getState();return ()=>useActivityStore.setState(snapshot,true);})()];
  beginStorageBatch();
  try {
    const result = write();
    commitStorageBatch();
    return result;
  } catch (cause) {
    for (const restore of [
      ...restores,
      () => useAccountStore.setState(accounts,true),
      () => useReportFilterStore.setState(reportFilters,true),
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
    abortStorageBatch();
    if (cause instanceof Error && ['PermissionError', 'ManagerApprovalRequired'].includes(cause.name)) throw cause;
    throw new Error(
      `Unable to save data in this browser. ${cause instanceof Error ? cause.message : "Check available browser storage and try again."}`,
      { cause },
    );
  }
}
