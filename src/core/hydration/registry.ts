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
  {key:'tindapos:calendar',persist:useCalendarStore.persist},
  {key:'tindapos:notification',persist:useNotificationStore.persist},
  {key:'tindapos:chat',persist:useChatStore.persist},
  {key:'tindapos:email',persist:useEmailStore.persist},
  {key:'tindapos:ticket',persist:useTicketStore.persist},
  {key:'tindapos:content',persist:useContentStore.persist},
  {key:'tindapos:document',persist:useDocumentStore.persist},
  {key:'tindapos:note',persist:useNoteStore.persist},
  {key:'tindapos:guide',persist:useGuideStore.persist},
  {key:'tindapos:errors',persist:useErrorLogStore.persist},
  {key:'tindapos:meta',persist:useMetaStore.persist},
  {key:'tindapos:accounts', persist:useAccountStore.persist},
  {key:'tindapos:activity', persist:useActivityStore.persist},
  {key:'tindapos:attendance', persist:useAttendanceStore.persist},
  {key:'tindapos:auth', persist:useAuthStore.persist},
  {key:'tindapos:branches', persist:useBranchesStore.persist},
  {key:'tindapos:active-branch', persist:useBranchStore.persist},
  {key:'tindapos:catalog', persist:useCatalogStore.persist},
  {key:'tindapos:coupons', persist:useCouponStore.persist},
  {key:'tindapos:customers', persist:useCustomerStore.persist},
  {key:'tindapos:held-orders', persist:useHeldOrderStore.persist},
  {key:'tindapos:holidays', persist:useHolidayStore.persist},
  {key:'tindapos:orders', persist:useOrderStore.persist},
  {key:'tindapos:payroll', persist:usePayrollStore.persist},
  {key:'tindapos:pos', persist:usePosStore.persist},
  {key:'tindapos:products', persist:useProductStore.persist},
  {key:'tindapos:purchase', persist:usePurchaseStore.persist},
  {key:'tindapos:refund', persist:useRefundStore.persist},
  {key:'tindapos:report-filters', persist:useReportFilterStore.persist},
  {key:'tindapos:roles', persist:useRoleStore.persist},
  {key:'tindapos:settings', persist:useSettingsStore.persist},
  {key:'tindapos:shifts', persist:useShiftStore.persist},
  {key:'tindapos:staff', persist:useStaffStore.persist},
  {key:'tindapos:stock', persist:useStockStore.persist},
  {key:'tindapos:supplier', persist:useSupplierStore.persist},
  {key:'tindapos-theme', persist:useThemeStore.persist},
  {key:'tindapos:stock-transfers', persist:useTransferStore.persist},
  {key:'tindapos:wallet', persist:useWalletStore.persist}
];
