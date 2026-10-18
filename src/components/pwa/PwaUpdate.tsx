import { useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { usePosStore } from '../../store/usePosStore';
export function PwaUpdate() {
 const {needRefresh:[waiting],updateServiceWorker}=useRegisterSW();
 const [message,setMessage]=useState('');
 if(!waiting)return null;
 const reload=()=>{if(usePosStore.getState().cart.length || document.querySelector('dialog[open]')){setMessage('Finish or hold your POS cart and close open forms before reloading.');return;} void updateServiceWorker(true);};
 return <aside role="status" className="fixed bottom-20 left-3 z-[100] max-w-sm rounded-lg border bg-white p-4 text-slate-900 shadow-lg dark:border-slate-600 dark:bg-slate-900 dark:text-white"><p>A new version is available.</p><button className="btn mt-2" onClick={reload}>Reload</button>{message&&<p>{message}</p>}</aside>;
}
