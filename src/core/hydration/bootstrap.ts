import { persistedStores } from './registry';
import { localKeys, flushStorage } from '../storage';
import { migrateLegacyKey } from '../storage/legacy';
import { storageEvents } from '../storage/events';
import { dataService } from '../../services/dataService';
import { initializePosData } from '../../services/initializePosData';
import { initializeStaffData } from '../../data/seed/phase5';
import { initializeAccountData } from '../../data/seed/accounts';
import { initializeBranches } from '../../services/initializeBranches';
import { ensureCashDrawers } from '../../services/cashDrawerService';
let boot: Promise<void> | undefined;
export function hydrateApplication() {
  boot ??= (async () => {
    for (const store of persistedStores) if (!localKeys.has(store.key)) await migrateLegacyKey(store.key);
    for (const store of persistedStores) await store.persist.rehydrate();
    if (storageEvents.get().some(p => p.kind !== 'write')) throw new Error('Data recovery required.');
    dataService.initialize();
    initializePosData();
    initializeStaffData();
    initializeAccountData();
    initializeBranches();
    ensureCashDrawers();
    await flushStorage();
  })();
  return boot;
}
