import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { Phase8Data } from '../types/phase8';
type State = Pick<Phase8Data, 'conversations' | 'messages'>;
export const useChatStore = create<State>()(persist<State>(() => ({conversations:[],messages:[]}), {name:'tindapos:chat',...storageOptions<State>('tindapos:chat'),version:1}));
