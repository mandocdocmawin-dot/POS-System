import { useContentStore } from '../store/useContentStore';
import { useStaffStore } from '../store/useStaffStore';
import { currentUser } from './phase8Context';
import { profileService } from './profileService';
import { profileProjectSchema, type ProfileProject } from '../types/phase8';
import { activityService } from './activityService';

export const profileWorkspaceService = {
  people: () => { const user = currentUser(); return useStaffStore.getState().staff.filter(s => s.status === 'active' && (user.role === 'admin' || s.branchIds.some(id => user.branchIds.includes(id)))); },
  follow: (target: string) => { const user = currentUser(); if (target === user.id || !profileWorkspaceService.people().some(s => s.id === target)) throw new Error('Choose another active colleague in your branches.'); const follows = useContentStore.getState().follows ?? {}, ids = follows[user.id] ?? []; useContentStore.setState({follows:{...follows,[user.id]:ids.includes(target)?ids.filter(id=>id!==target):[...ids,target]}}); },
  projects: (ownerId: string) => { profileService.get(ownerId); return (useContentStore.getState().projects ?? []).filter(p => p.ownerId === ownerId || p.memberIds.includes(ownerId)); },
  saveProject: (input: ProfileProject) => { const user = currentUser(), projects = useContentStore.getState().projects ?? [], old = projects.find(p => p.id === input.id); if ((old?.ownerId ?? input.ownerId) !== user.id) throw new Error('Only the project owner can edit this project.'); const project = profileProjectSchema.parse({...input,ownerId:user.id,title:input.title.trim(),createdAt:old?.createdAt??new Date().toISOString()}); if (project.memberIds.some(id => !profileWorkspaceService.people().some(s => s.id === id))) throw new Error('Choose active colleagues in your branches.'); useContentStore.setState({projects:old?projects.map(p=>p.id===project.id?project:p):[...projects,project]}); activityService.log('staff',user.id,old?'edit':'create',project.title); },
  removeProject: (id: string) => { const user = currentUser(), projects = useContentStore.getState().projects ?? []; if (!projects.some(p=>p.id===id&&p.ownerId===user.id)) throw new Error('Only the project owner can delete this project.'); useContentStore.setState({projects:projects.filter(p=>p.id!==id)}); activityService.log('staff',user.id,'delete','Deleted profile project'); },
};
