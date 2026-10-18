import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';
import type { Phase8Data } from '../types/phase8';
type State = Pick<Phase8Data, 'documents'>;
export const useDocumentStore = create<State>()(persist<State>(() => ({documents:[]}), {name:'tindapos:document',...storageOptions<State>('tindapos:document'),version:1}));
