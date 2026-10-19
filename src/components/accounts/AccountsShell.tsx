import '../../styles/reports.css';
import type {ReactNode} from 'react';
import {CommerceWorkspace} from '../customers/CommerceWorkspace';
import {useLocalData} from '../../services/useLocalData';
export function AccountsShell({title,actions,children}:{title:string;actions?:ReactNode;children:ReactNode}){
 useLocalData();
 return <CommerceWorkspace title={title} section="Accounts">{actions&&<div className="mb-4 flex justify-end gap-2">{actions}</div>}{children}</CommerceWorkspace>;
}
