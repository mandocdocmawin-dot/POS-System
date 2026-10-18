import {version} from '../../package.json';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { storageOptions } from '../core/storage/options';

type State={schemaVersion:number;appVersion:string;installedAt:string;lastMigrationAt?:string;lastBackupAt?:string};
export const useMetaStore=create<State>()(persist<State>(()=>({schemaVersion:8,appVersion:version,installedAt:new Date().toISOString()}),{name:'tindapos:meta',...storageOptions<State>('tindapos:meta'),version:1}));
