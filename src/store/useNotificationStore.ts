import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { Phase8Data } from '../types/phase8';
type State = Pick<Phase8Data, 'notificationStates' | 'prefs'>;
export const useNotificationStore = create<State>()(persist<State>(() => ({notificationStates:[],prefs:[]}), {name:'tindapos:notification',...storageOptions<State>('tindapos:notification'),version:1}));
