import {create} from 'zustand';
import {persist} from 'zustand/middleware';
export interface AuthState {currentUserId:string | null}
export const useAuthStore=create<AuthState>()(persist<AuthState>(()=>({currentUserId:null}),{name:'tindapos:auth',version:1}));
