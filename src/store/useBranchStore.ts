import {create} from 'zustand';
import {persist} from 'zustand/middleware';
// Legacy identifiers remain stable so saved staff and records retain their links.
export const branches=['Main Branch','Branch 2','Head Office'] as const;
export const useBranchStore=create<{activeBranchId:string}>()(persist(()=>({activeBranchId:'Main Branch'}),{name:'tindapos:active-branch',version:1}));
