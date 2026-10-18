import { useCalendarStore } from '../../store/useCalendarStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useChatStore } from '../../store/useChatStore';
import { useEmailStore } from '../../store/useEmailStore';
import { useTicketStore } from '../../store/useTicketStore';
import { useContentStore } from '../../store/useContentStore';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useNoteStore } from '../../store/useNoteStore';
import { useGuideStore } from '../../store/useGuideStore';
import { useErrorLogStore } from '../../store/useErrorLogStore';
import { useMetaStore } from '../../store/useMetaStore';
import { useAccountStore } from '../../store/useAccountStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useBranchesStore } from '../../store/useBranchesStore';
import { useBranchStore } from '../../store/useBranchStore';
import { useCatalogStore } from '../../store/useCatalogStore';
import { useCouponStore } from '../../store/useCouponStore';
import { useCustomerStore } from '../../store/useCustomerStore';
import { useHeldOrderStore } from '../../store/useHeldOrderStore';
import { useHolidayStore } from '../../store/useHolidayStore';
import { useOrderStore } from '../../store/useOrderStore';
import { usePayrollStore } from '../../store/usePayrollStore';
import { usePosStore } from '../../store/usePosStore';
import { useProductStore } from '../../store/useProductStore';
import { usePurchaseStore } from '../../store/usePurchaseStore';
import { useRefundStore } from '../../store/useRefundStore';
import { useReportFilterStore } from '../../store/useReportFilterStore';
import { useRoleStore } from '../../store/useRoleStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useShiftStore } from '../../store/useShiftStore';
import { useStaffStore } from '../../store/useStaffStore';
import { useStockStore } from '../../store/useStockStore';
import { useSupplierStore } from '../../store/useSupplierStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useTransferStore } from '../../store/useTransferStore';
import { useWalletStore } from '../../store/useWalletStore';
export const persistedStores = [
  {key:'tindapos:calendar',persist:useCalendarStore.persist,getState:useCalendarStore.getState},
  {key:'tindapos:notification',persist:useNotificationStore.persist,getState:useNotificationStore.getState},
  {key:'tindapos:chat',persist:useChatStore.persist,getState:useChatStore.getState},
  {key:'tindapos:email',persist:useEmailStore.persist,getState:useEmailStore.getState},
  {key:'tindapos:ticket',persist:useTicketStore.persist,getState:useTicketStore.getState},
  {key:'tindapos:content',persist:useContentStore.persist,getState:useContentStore.getState},
  {key:'tindapos:document',persist:useDocumentStore.persist,getState:useDocumentStore.getState},
  {key:'tindapos:note',persist:useNoteStore.persist,getState:useNoteStore.getState},
  {key:'tindapos:guide',persist:useGuideStore.persist,getState:useGuideStore.getState},
  {key:'tindapos:errors',persist:useErrorLogStore.persist,getState:useErrorLogStore.getState},
  {key:'tindapos:meta',persist:useMetaStore.persist,getState:useMetaStore.getState},
  {key:'tindapos:accounts', persist:useAccountStore.persist,getState:useAccountStore.getState},
  {key:'tindapos:activity', persist:useActivityStore.persist,getState:useActivityStore.getState},
  {key:'tindapos:attendance', persist:useAttendanceStore.persist,getState:useAttendanceStore.getState},
  {key:'tindapos:auth', persist:useAuthStore.persist,getState:useAuthStore.getState},
  {key:'tindapos:branches', persist:useBranchesStore.persist,getState:useBranchesStore.getState},
  {key:'tindapos:active-branch', persist:useBranchStore.persist,getState:useBranchStore.getState},
  {key:'tindapos:catalog', persist:useCatalogStore.persist,getState:useCatalogStore.getState},
  {key:'tindapos:coupons', persist:useCouponStore.persist,getState:useCouponStore.getState},
  {key:'tindapos:customers', persist:useCustomerStore.persist,getState:useCustomerStore.getState},
  {key:'tindapos:held-orders', persist:useHeldOrderStore.persist,getState:useHeldOrderStore.getState},
  {key:'tindapos:holidays', persist:useHolidayStore.persist,getState:useHolidayStore.getState},
  {key:'tindapos:orders', persist:useOrderStore.persist,getState:useOrderStore.getState},
  {key:'tindapos:payroll', persist:usePayrollStore.persist,getState:usePayrollStore.getState},
  {key:'tindapos:pos', persist:usePosStore.persist,getState:usePosStore.getState},
  {key:'tindapos:products', persist:useProductStore.persist,getState:useProductStore.getState},
  {key:'tindapos:purchase', persist:usePurchaseStore.persist,getState:usePurchaseStore.getState},
  {key:'tindapos:refund', persist:useRefundStore.persist,getState:useRefundStore.getState},
  {key:'tindapos:report-filters', persist:useReportFilterStore.persist,getState:useReportFilterStore.getState},
  {key:'tindapos:roles', persist:useRoleStore.persist,getState:useRoleStore.getState},
  {key:'tindapos:settings', persist:useSettingsStore.persist,getState:useSettingsStore.getState},
  {key:'tindapos:shifts', persist:useShiftStore.persist,getState:useShiftStore.getState},
  {key:'tindapos:staff', persist:useStaffStore.persist,getState:useStaffStore.getState},
  {key:'tindapos:stock', persist:useStockStore.persist,getState:useStockStore.getState},
  {key:'tindapos:supplier', persist:useSupplierStore.persist,getState:useSupplierStore.getState},
  {key:'tindapos-theme', persist:useThemeStore.persist,getState:useThemeStore.getState},
  {key:'tindapos:stock-transfers', persist:useTransferStore.persist,getState:useTransferStore.getState},
  {key:'tindapos:wallet', persist:useWalletStore.persist,getState:useWalletStore.getState}
];
