import {useRoleStore} from '../store/useRoleStore';
import {useCurrentUser} from './useCurrentUser';
import {hasPermission} from '../utils/permissions';
import {routePermission} from '../config/permissions';
import {menu,type MenuItem} from '../config/menu';
export function usePermission(){const user=useCurrentUser(),roles=useRoleStore(s=>s.roles);const can=(key:string)=>hasPermission(user,key,roles);return {can,canPath:(path:string)=>can(routePermission(path))};}
export function useAccessibleMenu(){const {canPath}=usePermission();const filter=(items:MenuItem[]):MenuItem[]=>items.flatMap(item=>{if(item.children){const children=filter(item.children);return children.length?[{...item,children}]:[];}return canPath(item.path)?[item]:[];});return menu.map(section=>({...section,groups:section.groups.map(group=>({...group,items:filter(group.items)})).filter(g=>g.items.length)})).filter(section=>section.groups.length);}
