import {useState} from 'react';
import {ApprovalDialog} from '../components/approvals/ApprovalDialog';
import {ManagerApprovalRequired} from '../services/approvalService';
export function useApproval() {
 const [pending,setPending]=useState<{scope:string;action:()=>void|Promise<void>}>();
 const run=async(action:()=>void|Promise<void>)=>{try{await action();}catch(cause){if(cause instanceof ManagerApprovalRequired){setPending({scope:cause.scope,action});return;}throw cause;}};
 return {run,dialog:pending?<ApprovalDialog scope={pending.scope} onClose={()=>setPending(undefined)} onApproved={pending.action}/>:null};
}
