import {useEffect} from 'react';
export function focusPosSearch() {
 requestAnimationFrame(()=>{if(!document.querySelector('dialog[open]'))document.getElementById('pos-search')?.focus();});
}
export function usePosShortcuts(actions:{customer:()=>void;payment:()=>void;hold:()=>void;clear:()=>void;quantity:(delta:number)=>void}) {
 useEffect(()=>{
  const keydown=(event:KeyboardEvent)=>{
   if(event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||document.querySelector('dialog[open]'))return;
   const target=event.target;
   const typing=target instanceof HTMLElement&&(target.matches('input,textarea,select')||target.isContentEditable);
   const shortcuts:Record<string,()=>void>={F2:focusPosSearch,F4:actions.customer,F8:actions.payment,F9:actions.hold,F10:actions.clear};
   if(shortcuts[event.key]){event.preventDefault();shortcuts[event.key]();return;}
   if(!typing&&(event.key==='+'||event.key==='-')){event.preventDefault();actions.quantity(event.key==='+'?1:-1);}
  };
  window.addEventListener('keydown',keydown);return ()=>window.removeEventListener('keydown',keydown);
 },[actions]);
}
