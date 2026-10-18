import {useChatStore} from '../store/useChatStore';
import {useStaffStore} from '../store/useStaffStore';
export function syncGeneralMembers(){const ids=useStaffStore.getState().staff.filter(s=>s.status==='active').map(s=>s.id);useChatStore.setState(s=>({conversations:s.conversations.map(c=>c.type==='group'&&c.name==='#general'?{...c,memberIds:[...new Set([...c.memberIds,...ids])]}:c)}));}
