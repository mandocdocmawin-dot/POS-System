import {useAuthStore} from '../store/useAuthStore';
import {useStaffStore} from '../store/useStaffStore';
export function useCurrentUser(){const id=useAuthStore(s=>s.currentUserId);return useStaffStore(s=>s.staff.find(user=>user.id===id)??null);}
