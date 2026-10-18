import { useActivityStore } from '../store/useActivityStore';
import { useOrderStore } from '../store/useOrderStore';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { branchService } from './branchService';
import { currentUser } from './phase8Context';
export const activityHistoryService = {
  branches: () => { const user = currentUser('activity:view'); return branchService.list().filter(b => user.role === 'admin' || user.branchIds.includes(b.id)); },
  list: (branchId = 'all') => {
    currentUser('activity:view'); const allowed = activityHistoryService.branches().map(b => b.id);
    if (branchId !== 'all') branchService.assertAccess(branchId);
    return structuredClone(useActivityStore.getState().logs.filter(log => {
      const branch = log.entityType === 'order' ? useOrderStore.getState().orders.find(o => o.id === log.entityId)?.branchId : log.entityType === 'purchase' ? usePurchaseStore.getState().purchases.find(p => p.id === log.entityId)?.branchId : undefined;
      return !branch || (allowed.includes(branch) && (branchId === 'all' || branchId === branch));
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  },
};
