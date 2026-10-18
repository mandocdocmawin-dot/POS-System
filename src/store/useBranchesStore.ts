import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {branchSchema,type Branch} from '../types/settings';
import {defaultBranches} from '../utils/branchMigration';
export const useBranchesStore=create<{branches:Branch[];migrationVersion:number}>()(persist(()=>({branches:defaultBranches(),migrationVersion:0}),{name:'tindapos:branches',version:1,merge:(value,current)=>{const data=value as {branches?:unknown;migrationVersion?:number}|undefined,result=branchSchema.array().safeParse(data?.branches);return result.success?{branches:result.data,migrationVersion:data?.migrationVersion??0}:current;}}));
