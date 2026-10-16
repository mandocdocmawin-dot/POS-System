import type {ReactNode} from 'react';
import {usePermission} from '../../hooks/usePermission';
export function Can({permission,children,fallback=null}:{permission:string;children:ReactNode;fallback?:ReactNode}){const {can}=usePermission();return <>{can(permission)?children:fallback}</>;}
