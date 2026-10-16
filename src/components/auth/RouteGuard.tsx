import type {ReactNode} from 'react';
import {Navigate,useLocation} from 'react-router-dom';
import {useAuthStore} from '../../store/useAuthStore';
import {useStaffStore} from '../../store/useStaffStore';
import {useRoleStore} from '../../store/useRoleStore';
import {routePermission} from '../../config/permissions';
import {hasPermission} from '../../utils/permissions';
import {ForbiddenPage} from './ForbiddenPage';
export function RouteGuard({children}:{children:ReactNode}){const id=useAuthStore(s=>s.currentUserId),staff=useStaffStore(s=>s.staff),roles=useRoleStore(s=>s.roles),{pathname}=useLocation();const user=staff.find(s=>s.id===id);if(!user)return <Navigate to="/sign-in" replace/>;if(!hasPermission(user,routePermission(pathname),roles))return <ForbiddenPage/>;return <>{user.status==='inactive'&&<div role="status" className="bg-amber-100 px-5 py-2 text-sm text-amber-900">Inactive account — demo access is enabled.</div>}{children}</>;}
