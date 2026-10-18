import { dataService } from './dataService';
import { runIntegrityCheck, customerCredit, customerWallet } from '../utils/integrity';
import { currentUser } from './phase8Context';
import { useCustomerStore } from '../store/useCustomerStore';
import { localTransaction } from './localTransaction';
import { activityService } from './activityService';
import { fromCentavos } from '../utils/pos';
export const integrityService = {
  check: () => { currentUser('settings:manage'); return runIntegrityCheck(dataService.snapshot()); },
  repair: (type: 'credit' | 'wallet') => {
    currentUser('settings:manage'); const snapshot = dataService.snapshot();
    const customers = snapshot.customers.map(c => ({ ...c, [type === 'credit' ? 'creditBalance' : 'walletBalance']: fromCentavos(type === 'credit' ? customerCredit(snapshot, c.id) : customerWallet(snapshot, c.id)) }));
    if (customers.some(c => c.creditBalance < 0 || c.walletBalance < 0)) throw new Error('Repair source data contains a negative balance. Inspect the underlying records first.');
    if (JSON.stringify(customers) === JSON.stringify(snapshot.customers)) return;
    localTransaction(() => { useCustomerStore.setState({ customers }); activityService.log('data', type, 'repair', `Recomputed customer ${type} balances from source records`); });
  },
};
