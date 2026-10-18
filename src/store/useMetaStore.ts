import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';

type State={schemaVersion:number;appVersion:string;installedAt:string;lastMigrationAt?:string;lastBackupAt?:string};
export const useMetaStore=create<State>()(persist<State>(()=>({schemaVersion:8,appVersion:'0.0.0',installedAt:new Date().toISOString()}),{name:'tindapos:meta',...storageOptions<State>('tindapos:meta'),version:1}));
