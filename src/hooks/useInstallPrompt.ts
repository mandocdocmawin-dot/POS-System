import { useState, useSyncExternalStore } from 'react';
import { activityService } from '../services/activityService';
interface InstallEvent extends Event { prompt():Promise<void>; userChoice:Promise<{outcome:'accepted'|'dismissed'}> }
let deferred:InstallEvent|null=null;const listeners=new Set<()=>void>();const notify=()=>listeners.forEach(fn=>fn());
const installed=()=>window.matchMedia('(display-mode: standalone)').matches;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event as InstallEvent;notify();});
window.addEventListener('appinstalled',()=>{deferred=null;notify();activityService.log('data','pwa','install','Installed TindaPOS on this device');});
export function useInstallPrompt(){const available=useSyncExternalStore(fn=>{listeners.add(fn);return()=>{listeners.delete(fn);};},()=>!!deferred&&!installed());const [message,setMessage]=useState('');return {available,message,install:async()=>{if(!deferred){setMessage('Use your browser menu to install after opening the production app over HTTPS or localhost.');return;}const event=deferred;await event.prompt();const choice=await event.userChoice;if(choice.outcome==='accepted'){deferred=null;notify();}}};}
