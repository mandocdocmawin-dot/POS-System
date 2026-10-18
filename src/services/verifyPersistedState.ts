import {persistedStores} from '../core/hydration/registry';
import {flushStorage,localKeys} from '../core/storage';
import {rawDatabase} from '../core/storage/database';
function canonical(value:unknown):string{if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value!==null&&typeof value==='object')return '{'+Object.entries(value).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}';return JSON.stringify(value);}
export async function verifyPersistedState(){
 if(import.meta.env.MODE==='test'&&typeof indexedDB==='undefined')return;
 const expected=persistedStores.filter(s=>s.key!=='tindapos-theme').map(s=>({key:s.key,state:JSON.parse(JSON.stringify(s.getState())) as unknown}));
 await flushStorage();
 for(const {key,state}of expected){const raw=localKeys.has(key)?localStorage.getItem(key):await rawDatabase.get(key);if(typeof raw!=='string'||canonical(JSON.parse(raw).state)!==canonical(state))throw new Error('Imported data could not be verified. Previous records have been restored; free storage and retry.');}
}
