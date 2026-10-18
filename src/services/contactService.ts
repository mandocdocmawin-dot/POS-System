import { currentUser } from './phase8Context';
import { settingsService } from './settingsService';
import { branchService } from './branchService';
export const contactService = {
  info: () => { const user = currentUser('help:use'); return { name: user.name, email: user.email, business: settingsService.get().general, branches: branchService.list().filter(b => b.status === 'active') }; },
};
