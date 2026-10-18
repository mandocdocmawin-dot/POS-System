import { useContentStore } from '../store/useContentStore';
import { planSchema, type Plan } from '../types/phase8';
import { currentUser, canUse, timestamp } from './phase8Context';
import { activityService } from './activityService';
import { localDay } from '../utils/calendar';
export const demoPaymentMethods = ['Visa •••• 4242 (demo)', 'Mastercard •••• 5556 (demo)', 'GCash demo wallet'];
export const yearlySaving = (plan: Plan) => Math.max(0, plan.priceMonthly * 12 - plan.priceYearly);
export const planService = {
  list: (publicOnly = false) => structuredClone(useContentStore.getState().plans.filter(p => p.status === 'active' || (!publicOnly && canUse('content:manage'))).sort((a, b) => a.order - b.order)),
  billing: () => { currentUser('billing:view'); const s = useContentStore.getState(); return structuredClone({ subscription: s.subscription, invoices: s.invoices }); },
  save: (input: Plan) => { currentUser('content:manage'); const next = planSchema.parse(input); useContentStore.setState(s => ({ plans: s.plans.some(p => p.id === next.id) ? s.plans.map(p => p.id === next.id ? next : p) : [...s.plans, next] })); },
  remove: (id: string) => { currentUser('content:manage'); if (useContentStore.getState().subscription?.planId === id) throw new Error('The subscribed plan cannot be deleted. Deactivate it instead.'); useContentStore.setState(s => ({ plans: s.plans.filter(p => p.id !== id) })); },
  choose: (id: string, billingCycle: 'monthly' | 'yearly') => {
    currentUser('billing:view'); const s = useContentStore.getState(), plan = s.plans.find(p => p.id === id && p.status === 'active'); if (!plan) throw new Error('Choose an active plan.');
    const now = new Date(), year = now.getFullYear(), next = new Date(now); next.setDate(1); next.setMonth(now.getMonth() + (billingCycle === 'yearly' ? 12 : 1)); const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate(); next.setDate(Math.min(now.getDate(), lastDay));
    const counter = Math.max(0, ...s.invoices.filter(i => i.invoiceNo.startsWith(`BILL-${year}-`)).map(i => Number(i.invoiceNo.split('-').at(-1)) || 0)) + 1;
    useContentStore.setState({ subscription: { planId: id, billingCycle, startedAt: timestamp(), nextBillingDate: localDay(next), paymentMethodLabel: s.subscription?.paymentMethodLabel ?? demoPaymentMethods[0] }, invoices: [...s.invoices, { id: crypto.randomUUID(), invoiceNo: `BILL-${year}-${String(counter).padStart(4, '0')}`, planId: id, amount: billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly, status: 'paid', issuedAt: timestamp() }] }); activityService.log('plan', id, 'change', `Changed demo plan to ${plan.name}`);
  },
  paymentMethod: (label: string) => { currentUser('billing:view'); if (!demoPaymentMethods.includes(label)) throw new Error('Select a preset demo method.'); const sub = useContentStore.getState().subscription; if (!sub) throw new Error('Choose a plan first.'); useContentStore.setState({ subscription: { ...sub, paymentMethodLabel: label } }); },
};
