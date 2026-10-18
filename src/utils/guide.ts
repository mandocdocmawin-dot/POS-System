export const guideSteps = [
  { id: 'sale', title: 'Make a sale', entity: 'order', actions: ['create', 'complete'], link: '/pos' },
  { id: 'stock', title: 'Record stock movement', entity: 'stock', actions: ['create', 'adjust', 'in', 'out'], link: '/inventory/stock-list' },
  { id: 'customer', title: 'Add a customer', entity: 'customer', actions: ['create'], link: '/customers/add-customer' },
  { id: 'ticket', title: 'Create a help ticket', entity: 'ticket', actions: ['create'], link: '/help-center' },
  { id: 'backup', title: 'Export a backup', entity: 'data', actions: ['export'], link: '/settings/general#data' },
];
export function evaluateGuide(logs: { entityType: string; action: string; actor?: string }[], actor?: string) {
  return guideSteps.map(step => ({ ...step, complete: logs.some(log => log.entityType === step.entity && step.actions.includes(log.action) && (!actor || log.actor === actor)) }));
}
