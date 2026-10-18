import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { Phase8Data } from '../types/phase8';
type State = Pick<Phase8Data, 'notes'>;
export const useNoteStore = create<State>()(persist<State>(() => ({notes:[]}), {name:'tindapos:note',...storageOptions<State>('tindapos:note'),version:1}));
