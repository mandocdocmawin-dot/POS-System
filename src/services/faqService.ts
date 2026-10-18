import { useContentStore } from '../store/useContentStore';
import { faqSchema, type Faq } from '../types/phase8';
import { currentUser, canUse } from './phase8Context';
import { activityService } from './activityService';
export const faqService = {
  list: (publicOnly = false) => structuredClone(useContentStore.getState().faqs.filter(f => f.status === 'active' || (!publicOnly && canUse('content:manage'))).sort((a, b) => a.order - b.order)),
  save: (input: Faq) => { currentUser('content:manage'); const next = faqSchema.parse(input); useContentStore.setState(s => ({ faqs: s.faqs.some(f => f.id === next.id) ? s.faqs.map(f => f.id === next.id ? next : f) : [...s.faqs, next] })); activityService.log('faq', next.id, 'edit', next.question); },
};
