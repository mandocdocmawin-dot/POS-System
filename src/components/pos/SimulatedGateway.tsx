import { T } from "../../i18n/T";
import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
export function SimulatedGateway({onSuccess,onFailure}:{onSuccess:(reference:string)=>void;onFailure:()=>void}) {
 const [remaining,setRemaining]=useState(60);
 useEffect(()=>{const timer=window.setInterval(()=>setRemaining(v=>Math.max(0,v-1)),1000);return ()=>window.clearInterval(timer);},[]);
 return <Modal open title="DEMO · Waiting for payment…" onClose={onFailure}><div className="space-y-5 text-center"><div aria-label="Demo QR placeholder, not a real payment code" className="mx-auto grid h-40 w-40 grid-cols-5 border-8 border-black bg-white">{Array.from({length:25},(_,i)=><span key={i} className={(i%3===0||i%7===0)?'bg-black':'bg-white'}/>)}</div><p>Simulated payment · {remaining}s</p><p className="text-sm text-slate-500"><T text={"No real funds move. No external payment service is contacted."}/></p>{remaining===0&&<p role="alert">Demo payment expired. Close and try again.</p>}<div className="flex justify-center gap-3"><button type="button" className="btn-primary" disabled={!remaining} onClick={()=>onSuccess(`SIM-${crypto.randomUUID().replaceAll('-','').slice(0,6).toUpperCase()}`)}>Simulate success</button><button type="button" className="btn" onClick={onFailure}>Simulate failure</button></div></div></Modal>;
}
