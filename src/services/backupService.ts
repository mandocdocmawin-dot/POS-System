import { dataService } from './dataService';
import { useMetaStore } from '../store/useMetaStore';
import { storageUsageService } from './storageUsageService';
import { activityService } from './activityService';
export const backupService = {
  export: async () => { const text = await dataService.export(); await storageUsageService.markBackup(); activityService.log('data', 'backup', 'export', 'Exported data backup'); return text; },
  lastBackup: () => useMetaStore.getState().lastBackupAt,
  overdue: (now = new Date()) => { const last = useMetaStore.getState().lastBackupAt; return !last || now.getTime() - Date.parse(last) > 7 * 86400000; },
};
