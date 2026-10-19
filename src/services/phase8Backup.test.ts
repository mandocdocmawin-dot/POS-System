import { useContentStore } from '../store/useContentStore';
import {version} from '../../package.json';
import {beforeEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{const values=new Map<string,string>();const storage={getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>{values.set(k,v);},removeItem:(k:string)=>{values.delete(k);}};Object.defineProperty(globalThis,'localStorage',{value:storage,configurable:true});Object.defineProperty(globalThis,'window',{value:{localStorage:storage},configurable:true});});
import {dataService} from './dataService';import {authService} from './authService';import {createPhase5Seed} from '../data/seed/phase5';import {useStaffStore} from '../store/useStaffStore';import {useRoleStore} from '../store/useRoleStore';import {useAuthStore} from '../store/useAuthStore';import {useDocumentStore} from '../store/useDocumentStore';import {useCalendarStore} from '../store/useCalendarStore';import {useGuideStore} from '../store/useGuideStore';
beforeEach(()=>{const seed=createPhase5Seed();useStaffStore.setState({staff:seed.staff});useRoleStore.setState({roles:seed.roles});useAuthStore.setState({currentUserId:'staff-admin'});dataService.reset();authService.loginDemo('admin');});
it('round trips all phase 8 data and marks document metadata as missing without exporting blobs',async()=>{const now=new Date().toISOString();useDocumentStore.setState({documents:[{id:'doc',staffId:'staff-admin',name:'note.txt',category:'other',mime:'text/plain',size:12,fileKey:'local-only',uploadedBy:'staff-admin',createdAt:now}]});useGuideStore.setState({startedAt:now,dismissed:true,collapsed:true});const text=await dataService.export(),original=JSON.parse(text);expect(original.phase8.documents).toHaveLength(1);expect(original.phase8.events.length).toBeGreaterThan(0);await dataService.import(text);const next=JSON.parse(await dataService.export());expect(next.phase8).toEqual({...original.phase8,documents:[{...original.phase8.documents[0],fileMissing:true}]});});
it('rejects dangling phase 8 references before changing any store',async()=>{const text=await dataService.export(),bad=JSON.parse(text);bad.phase8.events[0].createdBy='missing';await expect(dataService.import(JSON.stringify(bad))).rejects.toThrow('staff reference');expect(await dataService.export()).toBe(text);});
it('accepts legacy backups without phase 8 and resets all new records and guide state',async()=>{const legacy=JSON.parse(await dataService.export());delete legacy.phase8;await dataService.import(JSON.stringify(legacy));expect(useCalendarStore.getState().events).toEqual([]);authService.loginDemo('admin');await dataService.reset();expect(useCalendarStore.getState().events.length).toBeGreaterThan(0);expect(useGuideStore.getState().startedAt).toBe('');expect(useDocumentStore.getState().documents).toEqual([]);});

it('normalizes old app metadata and rejects future schemas without changing records',async()=>{const old=dataService.snapshot();old.phase8.meta={...old.phase8.meta!,schemaVersion:7,appVersion:'0.1.0'};await dataService.import(JSON.stringify(old));expect(dataService.snapshot().phase8.meta?.appVersion).toBe(version);expect(dataService.snapshot().phase8.meta?.schemaVersion).toBe(8);const before=await dataService.export(),future=dataService.snapshot();future.phase8.meta!.schemaVersion=9;await expect(dataService.import(JSON.stringify(future))).rejects.toThrow('newer app schema');expect(await dataService.export()).toBe(before);});

it('round trips profile projects and follows and rejects missing team members', async () => {
  useContentStore.setState({follows:{'staff-admin':['staff-manager']},projects:[{id:'project-backup',ownerId:'staff-admin',title:'Store review',description:'',status:'planned',memberIds:['staff-manager'],createdAt:new Date().toISOString()}]});
  const backup=await dataService.export();
  useContentStore.setState({follows:{},projects:[]});
  await dataService.import(backup);
  expect(useContentStore.getState().projects?.[0].title).toBe('Store review');
  expect(useContentStore.getState().follows?.['staff-admin']).toEqual(['staff-manager']);
  const invalid=JSON.parse(backup);invalid.phase8.projects[0].memberIds=['missing-person'];
  await expect(dataService.import(JSON.stringify(invalid))).rejects.toThrow('staff reference');
});
