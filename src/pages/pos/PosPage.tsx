import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {ShoppingBag} from 'lucide-react';
import {OrderPanel} from './OrderPanel';
import {ProductBrowser} from './ProductBrowser';
import {posService} from '../../services/posService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
import {focusPosSearch} from '../../hooks/usePosShortcuts';
const media=window.matchMedia('(max-width: 767px)');
const subscribe=(listener:()=>void)=>{media.addEventListener('change',listener);return ()=>media.removeEventListener('change',listener);};
export function Component() {
 useLocalData();const isPhone=useSyncExternalStore(subscribe,()=>media.matches);
 const [mobileOpen,setMobileOpen]=useState(false),panelRef=useRef<HTMLElement>(null);
 useEffect(()=>{
  if(!isPhone||!mobileOpen)return;
  const previous=document.activeElement;panelRef.current?.focus();
  const keydown=(e:KeyboardEvent)=>{
   if(document.querySelector('dialog[open]'))return;
   if(e.key==='Escape'){e.preventDefault();setMobileOpen(false);return;}
   if(e.key==='Tab'){
    const elements=panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select,textarea,a[href],[tabindex="0"]');
    const visible=Array.from(elements??[]).filter(el=>el.getClientRects().length>0);const first=visible[0],last=visible.at(-1);
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===panelRef.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   }
  };
  document.addEventListener('keydown',keydown);return ()=>{document.removeEventListener('keydown',keydown);if(previous instanceof HTMLElement)previous.focus();};
 },[isPhone,mobileOpen]);
 return <div onClick={event=>{const target=event.target;if(target instanceof HTMLElement&&target.closest('button')&&!target.closest('form')&&!isPhone)focusPosSearch();}} className="flex min-h-0 flex-1 overflow-hidden">
  <div inert={isPhone&&mobileOpen} className="flex min-h-0 min-w-0 flex-1 overflow-y-auto pb-24 md:overflow-hidden md:pb-0"><ProductBrowser/></div>
  {isPhone&&mobileOpen&&<button className="fixed inset-0 z-30 bg-slate-950/40" aria-label="Close cart backdrop" onClick={()=>setMobileOpen(false)}/>}
  <OrderPanel isPhone={isPhone} mobileOpen={mobileOpen} onClose={()=>setMobileOpen(false)} panelRef={panelRef}/>
  {isPhone&&!mobileOpen&&<button className="fixed inset-x-4 bottom-4 z-20 flex items-center justify-between rounded-xl bg-indigo-600 p-4 text-white shadow-lg" onClick={()=>setMobileOpen(true)}><span className="flex items-center gap-2"><ShoppingBag size={18}/>Cart ({posService.state().cart.length})</span><strong>{formatPHP(posService.totals().grandTotal)}</strong></button>}
 </div>;
}
