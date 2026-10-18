export const guideSteps = [
  { id:'sale',title:'Make a POS sale',matches:[['order','create']],link:'/pos',role:'Cashier' },
  { id:'hold',title:'Hold and resume a cart',matches:[['order','hold'],['order','resume']],link:'/pos',role:'Cashier',sameEntity:true },
  { id:'product',title:'Add a product with opening stock',matches:[['product','create'],['stock','initial']],link:'/products/add-product',role:'Manager',sameEntity:true },
  { id:'stock',title:'Record stock in',matches:[['stock','in']],link:'/inventory/stock-in',role:'Manager' },
  { id:'refund',title:'Refund an order',matches:[['refund','create']],link:'/orders/all-orders',role:'Manager' },
  { id:'expense',title:'Add an expense',matches:[['data','expense']],link:'/accounts/expense',role:'Admin' },
  { id:'report',title:'Open a report',matches:[['data','report-open']],link:'/reports/sales',role:'Manager' },
  { id:'settings',title:'Change a setting',matches:[['settings','update','edit','save']],link:'/settings/general',role:'Admin' },
  { id:'transfer',title:'Create a stock transfer',matches:[['transfer','create']],link:'/inventory/stock-transfer',role:'Manager' },
  { id:'role',title:'Switch demo role',matches:[['auth','switch-role']],link:'/account/account',role:'Any' },
  { id:'install',title:'Install the app',matches:[['data','install']],link:'/account/account',role:'Production PWA' },
  { id:'backup',title:'Export a backup',matches:[['data','export']],link:'/settings/general#data',role:'Admin' },
];
export function evaluateGuide(logs: {entityType:string;action:string;entityId?:string;createdAt?:string}[], startedAt: string) {
  const recent = startedAt ? logs.filter(log => !!log.createdAt && log.createdAt >= startedAt) : [];
  return guideSteps.map(step => {
    const candidates = step.matches.map(([entity,...actions]) => recent.filter(log => log.entityType === entity && actions.includes(log.action)));
    const complete = candidates.every(matches => matches.length > 0) && (!step.sameEntity || candidates[0].some(log => candidates.every(matches => matches.some(match => match.entityId === log.entityId))));
    return {...step,complete};
  });
}
