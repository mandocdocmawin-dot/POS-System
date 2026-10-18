import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { guideService } from '../../services/guideService';
import { useLocalData } from '../../services/useLocalData';
import { usePermission } from '../../hooks/usePermission';
export function DemoGuide() {
  useLocalData(); const state=guideService.state(),steps=guideService.steps(),complete=steps.filter(s=>s.complete).length,[open,setOpen]=useState(false),navigate=useNavigate(),{canPath}=usePermission();
  return <>{!state.dismissed&&<button className="btn-primary fixed bottom-5 right-5 z-20" onClick={()=>{guideService.start();setOpen(true);}}>Demo guide · {complete}/{steps.length}</button>}<Modal drawer open={open} title="Your TindaPOS demo guide" onClose={()=>{guideService.collapse();setOpen(false);}}><div className="space-y-5"><p>Try each workflow with sample data. Progress comes from activity since you started this guide.</p><label className="grid gap-2">{complete} of {steps.length} complete<progress className="h-3 w-full" value={complete} max={steps.length}/></label><ol className="space-y-3">{steps.map(step=><li className="flex items-center justify-between gap-3 rounded-lg border p-3 dark:border-slate-700" key={step.id}><div><p className="font-medium">{step.complete?'✓ ':''}{step.title}</p><p className="text-xs">Suggested role: {step.role}{!canPath(step.link)&&' · switch role in the user menu'}</p></div><button className="btn" onClick={()=>{navigate(canPath(step.link)?step.link:'/account/account');setOpen(false);}}>Go</button></li>)}</ol><div className="flex flex-wrap gap-3"><button className="btn" onClick={guideService.restart}>Restart guide</button><button className="btn" onClick={()=>{guideService.dismiss();setOpen(false);}}>Dismiss guide</button></div><p className="text-xs">Install becomes available in supported browsers after a production build.</p></div></Modal></>;
}
