import type { Transfer } from '../../types/accounts';
import { localDay, shiftDay } from '../../utils/reports/period';
export function seedTransfers():Transfer[]{return [0,1,2].map(i=>({id:`transfer-seed-${i}`,transferNo:`TF-${String(i+1).padStart(6,'0')}`,date:shiftDay(localDay(),-i*10),fromAccountId:i===1?'account-bank':'account-cash',toAccountId:i===1?'account-cash':'account-bank',amount:500000+i*100000,reference:'Demo deposit',createdBy:'Demo Admin',createdAt:new Date().toISOString()}));}
