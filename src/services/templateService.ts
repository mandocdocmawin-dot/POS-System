import { useEmailStore } from '../store/useEmailStore';
import { emailTemplateSchema, type EmailTemplate } from '../types/phase8';
import { currentUser, timestamp } from './phase8Context';
import { createTemplateSeed } from '../data/seed/templates';
import { renderTemplate } from '../utils/template';
export const templateService = {
  list: () => { currentUser('email:use'); return structuredClone(useEmailStore.getState().templates); },
  render: renderTemplate,
  save: (input: EmailTemplate) => { currentUser('email:use'); const old = useEmailStore.getState().templates.find(t => t.id === input.id); if (old?.isSystem || input.isSystem) currentUser('content:manage'); const next = emailTemplateSchema.parse({ ...input, isSystem: old?.isSystem ?? false, updatedAt: timestamp() }); useEmailStore.setState(s => ({ templates: old ? s.templates.map(t => t.id === next.id ? next : t) : [...s.templates, next] })); },
  remove: (id: string) => { currentUser('email:use'); const old = useEmailStore.getState().templates.find(t => t.id === id); if (old?.isSystem) throw new Error('System templates cannot be deleted.'); useEmailStore.setState(s => ({ templates: s.templates.filter(t => t.id !== id) })); },
  reset: (id: string) => { currentUser('content:manage'); const original = createTemplateSeed().find(t => t.id === id); if (!original) throw new Error('No default template.'); templateService.save(original); },
};
