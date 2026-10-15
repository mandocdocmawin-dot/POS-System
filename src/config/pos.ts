export const POS_CONFIG = {
  taxMode: 'inclusive' as 'inclusive' | 'exclusive',
  receiptWidth: 80 as 80 | 58,
  loyaltyPesosPerPoint: 100,
  tiers: { Regular: 0, Silver: 100, Gold: 500, Platinum: 1000 },
} as const;
export const WALK_IN_ID = 'customer-walk-in';
export const PAYMENT_METHODS = [
  {id:'cash',label:'Cash'}, {id:'gcash',label:'GCash'},
  {id:'maya',label:'Maya'}, {id:'card',label:'Card'}, {id:'bank',label:'Bank Transfer'},
] as const;
