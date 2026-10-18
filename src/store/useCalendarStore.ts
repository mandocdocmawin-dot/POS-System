import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { Phase8Data } from '../types/phase8';
type State = Pick<Phase8Data, 'events' | 'layers'>;
export const useCalendarStore = create<State>()(persist<State>(() => ({events:[],layers:{}}), {name:'tindapos:calendar',...storageOptions<State>('tindapos:calendar'),version:1}));
