import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { Phase8Data } from '../types/phase8';
type State = Pick<Phase8Data, 'tickets' | 'ticketCounters'>;
export const useTicketStore = create<State>()(persist<State>(() => ({tickets:[],ticketCounters:{}}), {name:'tindapos:ticket',...storageOptions<State>('tindapos:ticket'),version:1}));
