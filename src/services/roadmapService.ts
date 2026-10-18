import { featureStatus } from '../config/featureStatus';
import { routes } from '../config/menu';
import { useContentStore } from '../store/useContentStore';
import { currentUser } from './phase8Context';
export const roadmapService = {
  list: () => routes.filter(route => featureStatus[route.path]?.status === 'placeholder').map(route => ({ ...route, votes: useContentStore.getState().votes[route.path] ?? 0 })),
  vote: (path: string) => { currentUser(); if (!roadmapService.list().some(r => r.path === path)) throw new Error('This feature is not on the roadmap.'); useContentStore.setState(s => ({ votes: { ...s.votes, [path]: (s.votes[path] ?? 0) + 1 } })); },
};
