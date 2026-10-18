import {useSettingsStore} from '../store/useSettingsStore';
import {useCouponStore} from '../store/useCouponStore';
import {useBranchesStore} from '../store/useBranchesStore';
import {useTransferStore} from '../store/useTransferStore';
import {useBranchStore} from '../store/useBranchStore';
import {defaultSettings} from '../config/defaultSettings';
import {defaultBranches} from '../utils/branchMigration';
import {createCouponSeed} from '../data/seed/coupons';
import {createBranchStockSeed} from '../data/seed/branches';
import {createStockTransferSeed} from '../data/seed/stockTransfers';
import {initializeBranches} from './initializeBranches';
import {ensureCashDrawers} from './cashDrawerService';
import {useAuthStore} from '../store/useAuthStore';
import {useAccountStore} from '../store/useAccountStore';
import {useReportFilterStore} from '../store/useReportFilterStore';
import {createAccountSeed} from '../data/seed/accounts';
import {defaultReportFilter} from '../utils/reports/period';
import {useStaffStore} from '../store/useStaffStore';
import {useRoleStore} from '../store/useRoleStore';
import {useAttendanceStore} from '../store/useAttendanceStore';
import {useHolidayStore} from '../store/useHolidayStore';
import {useShiftStore} from '../store/useShiftStore';
import {usePayrollStore} from '../store/usePayrollStore';
import {createPhase5Seed} from '../data/seed/phase5';
import {requirePermission} from './authService';
import {createPhase4Seed} from '../data/seed/phase4';
import {useRefundStore} from '../store/useRefundStore';
import {useSupplierStore} from '../store/useSupplierStore';
import {usePurchaseStore} from '../store/usePurchaseStore';
import {useWalletStore} from '../store/useWalletStore';
import {useActivityStore} from '../store/useActivityStore';
import {useCustomerStore} from '../store/useCustomerStore';
import {useOrderStore} from '../store/useOrderStore';
import {useHeldOrderStore} from '../store/useHeldOrderStore';
import {usePosStore} from '../store/usePosStore';
import {createPosSeed} from '../data/seed/pos';
import {WALK_IN_ID} from '../config/pos';
import {formatOrderNo} from '../utils/orderNo';
import { localTransaction } from "./localTransaction";
import { validateBackup, type Backup } from "./backupSchema";
import { imageService } from "./imageService";
import { categories, subcategories } from "../data/seed/categories";
import { brands } from "../data/seed/brands";
import { units } from "../data/seed/units";
import { products, variants } from "../data/seed/products";
import { movements } from "../data/seed/movements";
import { useCatalogStore } from "../store/useCatalogStore";
import { useProductStore } from "../store/useProductStore";
import { useStockStore } from "../store/useStockStore";
function snapshot(): Backup {
  return {
    version: 1,
    phase7:structuredClone({settings:useSettingsStore.getState().settings,coupons:useCouponStore.getState().coupons,branches:useBranchesStore.getState().branches,transfers:useTransferStore.getState().transfers,activeBranchId:useBranchStore.getState().activeBranchId}),
    phase6:structuredClone(useAccountStore.getState()),
    reportFilter:structuredClone(useReportFilterStore.getState().filter),
    phase5:structuredClone({staff:useStaffStore.getState().staff,roles:useRoleStore.getState().roles,records:useAttendanceStore.getState().records,holidays:useHolidayStore.getState().holidays,shifts:useShiftStore.getState().shifts,runs:usePayrollStore.getState().runs,auth:useAuthStore.getState()}),
    refunds:structuredClone(useRefundStore.getState().refunds),refundCounter:useRefundStore.getState().counter,
    suppliers:structuredClone(useSupplierStore.getState().suppliers),
    purchases:structuredClone(usePurchaseStore.getState().purchases),purchaseReturns:structuredClone(usePurchaseStore.getState().returns),supplierPayments:structuredClone(usePurchaseStore.getState().payments),purchaseCounter:usePurchaseStore.getState().counter,returnCounter:usePurchaseStore.getState().returnCounter,
    walletTransactions:structuredClone(useWalletStore.getState().transactions),customerPayments:structuredClone(useWalletStore.getState().customerPayments),activityLogs:structuredClone(useActivityStore.getState().logs),
    ...structuredClone(useCustomerStore.getState()),
    ...structuredClone(useOrderStore.getState()),
    ...structuredClone(useHeldOrderStore.getState()),
    pos:structuredClone(usePosStore.getState()),
    ...structuredClone(useCatalogStore.getState()),
    ...structuredClone(useProductStore.getState()),
    ...structuredClone(useStockStore.getState()),
  };
}
function replace(data: Backup) {
  localTransaction(() => {
    useSettingsStore.setState({settings:data.phase7.settings,updatedAt:undefined,updatedBy:undefined});useCouponStore.setState({coupons:data.phase7.coupons});useBranchesStore.setState({branches:data.phase7.branches,migrationVersion:0});useTransferStore.setState({transfers:data.phase7.transfers});useBranchStore.setState({activeBranchId:data.phase7.activeBranchId});
    useAccountStore.setState(data.phase6,true);
    useReportFilterStore.setState({filter:data.reportFilter},true);
    useCatalogStore.setState(
      {
        categories: data.categories,
        subcategories: data.subcategories,
        brands: data.brands,
        units: data.units,
      },
      true,
    );
    useProductStore.setState(
      { products: data.products, variants: data.variants },
      true,
    );
    useStockStore.setState({ movements: data.movements }, true);
    useCustomerStore.setState({customers:data.customers},true);
    useOrderStore.setState({orders:data.orders,counter:data.counter},true);
    useHeldOrderStore.setState({heldOrders:data.heldOrders},true);
    usePosStore.setState(data.pos,true);
    useRefundStore.setState({refunds:data.refunds,counter:data.refundCounter},true);
    useSupplierStore.setState({suppliers:data.suppliers},true);
    usePurchaseStore.setState({purchases:data.purchases,returns:data.purchaseReturns,payments:data.supplierPayments,counter:data.purchaseCounter,returnCounter:data.returnCounter},true);
    useWalletStore.setState({transactions:data.walletTransactions,customerPayments:data.customerPayments},true);
    useActivityStore.setState({logs:data.activityLogs},true);
    useRoleStore.setState({roles:data.phase5.roles},true);
    useStaffStore.setState({staff:data.phase5.staff},true);
    useAttendanceStore.setState({records:data.phase5.records},true);
    useHolidayStore.setState({holidays:data.phase5.holidays},true);
    useShiftStore.setState({shifts:data.phase5.shifts},true);
    usePayrollStore.setState({runs:data.phase5.runs},true);
    useAuthStore.setState(data.phase5.auth,true);
    initializeBranches();ensureCashDrawers();
  });
}
function resetData() {
    const seed=createPosSeed();
    const phase4=createPhase4Seed(seed.customers,seed.orders);
    replace(structuredClone({version:1,phase7:{settings:structuredClone(defaultSettings),branches:defaultBranches(),coupons:createCouponSeed(),transfers:[],activeBranchId:'Main Branch'},phase6:createAccountSeed(),reportFilter:{...defaultReportFilter(),branchId:'Main Branch'},phase5:{...createPhase5Seed(),auth:{currentUserId:null}},refunds:phase4.refunds,refundCounter:phase4.refundCounter,suppliers:phase4.suppliers,purchases:phase4.purchases,purchaseReturns:phase4.returns,supplierPayments:phase4.payments,purchaseCounter:phase4.purchaseCounter,returnCounter:phase4.returnCounter,walletTransactions:phase4.transactions,customerPayments:phase4.customerPayments,activityLogs:phase4.logs,categories,subcategories,brands,units,products,variants,movements:[...movements,...seed.movements.map(m=>({...m,branchId:seed.orders.find(o=>o.orderNo===m.reference)?.branchId??'Main Branch'})),...phase4.movements,...createBranchStockSeed()],customers:seed.customers,orders:seed.orders,counter:seed.counter,heldOrders:[],pos:{cart:[],customerId:WALK_IN_ID,orderDiscount:{type:'fixed',value:0},note:'',activeOrderNo:formatOrderNo(seed.counter+1)}}));
    const product=products.find(p=>!p.hasVariants);if(product){const transfers=createStockTransferSeed(product.id);useTransferStore.setState({transfers});useStockStore.setState(s=>({movements:[...s.movements,...transfers.flatMap(t=>[{id:`${t.id}-out`,branchId:t.fromBranchId,productId:product.id,type:'out' as const,quantity:2,reason:'Transfer out',reference:t.transferNo,createdAt:t.createdAt,createdBy:'System'},...(t.status==='received'?[{id:`${t.id}-in`,branchId:t.toBranchId,productId:product.id,type:'in' as const,quantity:2,reason:'Transfer in',reference:t.transferNo,createdAt:t.createdAt,createdBy:'System'}]:[])])]}));}

}

export const dataService = {
  snapshot,
  export: async () => {
    const data = snapshot();
    const imageRefs=[{imageId:data.phase7.settings.general.logoId},...data.phase7.branches.map(b=>({imageId:b.photoId})),...data.orders.map(o=>({imageId:o.receiptSnapshot?.general.logoId})),...data.phase6.manualEntries.map(e=>({imageId:e.attachmentId})),...data.phase5.staff.map(s=>({imageId:s.avatarId})),...data.products,...data.pos.cart,...data.heldOrders.flatMap(h=>h.cart),...data.orders.flatMap(o=>o.items)];
    const all = imageRefs.some((p) => p.imageId)
      ? await imageService.export()
      : {};
    return JSON.stringify(
      {
        ...data,
        images: Object.fromEntries(
          Object.entries(all).filter(([id]) =>
            imageRefs.some((p) => p.imageId === id),
          ),
        ),
      },
      null,
      2,
    );
  },
  validate: (text: string) => validateBackup(JSON.parse(text)),
  import: async (text: string) => {
    requirePermission("settings:manage");
    const data = validateBackup(JSON.parse(text));
    const images: [string, Blob][] = [];
    for (const [id, value] of Object.entries(data.images ?? {})) {
      if (value.length > 3000000)
        throw new Error("Imported image is too large.");
      const bytes = Uint8Array.from(atob(value.split(",")[1]), (c) =>
        c.charCodeAt(0),
      );
      const blob = new Blob([bytes], { type: "image/jpeg" });
      const bitmap = await createImageBitmap(blob);
      const valid = bitmap.width <= 800 && bitmap.height <= 800;
      bitmap.close();
      if (!valid) throw new Error("Imported images must be at most 800px.");
      images.push([id, blob]);
    }
    const mapped: [string, Blob][] = [];
    for (const [id, blob] of images) {
      const freshId = crypto.randomUUID();
      [...data.products,...data.pos.cart,...data.heldOrders.flatMap(h=>h.cart),...data.orders.flatMap(o=>o.items)].forEach((p) => {
        if (p.imageId === id) p.imageId = freshId;
      });
      if(data.phase7.settings.general.logoId===id)data.phase7.settings.general.logoId=freshId;data.phase7.branches.forEach(b=>{if(b.photoId===id)b.photoId=freshId;});data.orders.forEach(o=>{if(o.receiptSnapshot?.general.logoId===id)o.receiptSnapshot.general.logoId=freshId;});
      data.phase5.staff.forEach(staff=>{if(staff.avatarId===id)staff.avatarId=freshId;});data.phase6.manualEntries.forEach(entry=>{if(entry.attachmentId===id)entry.attachmentId=freshId;});
      mapped.push([freshId, blob]);
    }
    if (mapped.length) await imageService.import(mapped);
    try {
      requirePermission("settings:manage");
      replace(data);
    } catch (e) {
      await Promise.all(mapped.map(([id]) => imageService.remove(id)));
      throw e;
    }
  },
  reset: () => { requirePermission('settings:manage'); resetData(); },
  initialize: () => {
    if (
      useCatalogStore.getState().categories.length === 0 &&
      useProductStore.getState().products.length === 0 &&
      useStockStore.getState().movements.length === 0
    )
      resetData();
  },
};

