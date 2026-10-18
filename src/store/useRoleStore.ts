import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import type { Role } from '../types/staff';
import {migratePhase7Roles} from '../config/permissions';
import {roleSchema} from '../types/staff';
export interface RoleState {roles:Role[]}
export const useRoleStore=create<RoleState>()(persist<RoleState>(()=>({roles:[]}),{name:'tindapos:roles',version:4,migrate:(state)=>{const roles=roleSchema.array().parse((state as RoleState).roles);return {roles:migratePhase7Roles(roles)};}}));

