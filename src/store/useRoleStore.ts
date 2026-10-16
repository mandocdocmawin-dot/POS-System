import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type { Role } from '../types/staff';
export interface RoleState {roles:Role[]}
export const useRoleStore=create<RoleState>()(persist<RoleState>(()=>({roles:[]}),{name:'tindapos:roles',version:1}));
