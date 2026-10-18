import {useEffect,useState} from 'react';
import {Store,ChevronDown,Check} from 'lucide-react';
import {Popover} from '../common/Popover';
import {ConfirmDialog} from '../common/ConfirmDialog';
import {branchService} from '../../services/branchService';
import {posService} from '../../services/posService';
import {useLocalData} from '../../services/useLocalData';
import {errorMessage,toast} from '../../services/toastService';
export function BranchSwitcher(){const revision=useLocalData(),[pending,setPending]=useState<string>();const allowed=branchService.allowed(),active=branchService.activeId();useEffect(()=>{try{branchService.ensureActive();}catch(e){toast.error(errorMessage(e));}},[revision]);return <><Popover label="Switch branch" align="left" className="btn" trigger={<><Store size={16}/><span className="hidden sm:inline">{branchService.get(active)?.name??'Choose branch'}</span><ChevronDown size={13}/></>}><div className="w-56">{allowed.map(b=><button key={b.id} className="flex w-full items-center gap-3 rounded p-3 text-sm" onClick={()=>{if(posService.state().cart.length&&b.id!==active)setPending(b.id);else branchService.switchTo(b.id);}}><Store size={15}/><span className="flex-1 text-left">{b.name}</span>{active===b.id&&<Check size={14}/>}</button>)}</div></Popover><ConfirmDialog open={!!pending} title="Switch branch and hold this cart?" message="The current cart will be saved under the old branch as Auto-held on branch switch." onClose={()=>setPending(undefined)} onConfirm={()=>{if(pending)branchService.switchTo(pending,true);}}/></>;}
