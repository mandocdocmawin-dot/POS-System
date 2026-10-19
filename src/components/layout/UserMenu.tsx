import { T } from "../../i18n/T";
import {InstallButton} from '../pwa/InstallButton';
import {guideService} from '../../services/guideService';
import {Link,useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {UserRound,Settings,ShieldCheck,LogOut,BookOpen,Headset,Rocket,Users} from 'lucide-react';
import {Popover} from '../common/Popover';
import {Drawer} from '../common/Drawer';
import {Avatar} from '../common/Avatar';
import {Can} from '../auth/Can';
import {RoleSwitcher} from '../auth/RoleSwitcher';
import {useCurrentUser} from '../../hooks/useCurrentUser';
import {useRoleStore} from '../../store/useRoleStore';
import {authService} from '../../services/authService';
export function UserMenu(){
 const user=useCurrentUser(),roles=useRoleStore(s=>s.roles),[profile,setProfile]=useState(false),[error,setError]=useState(''),navigate=useNavigate();
 const row='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800';
 return <><Popover label="User menu" trigger={<Avatar name={user?.name??'Demo user'} imageId={user?.avatarId} size="h-9 w-9"/>}>
  <div className="w-[min(18rem,85vw)] p-2">
   <div className="mb-2 flex items-center gap-3 border-b border-slate-100 p-3 dark:border-slate-700"><Avatar name={user?.name??'Demo user'} imageId={user?.avatarId} size="h-11 w-11"/><div className="min-w-0"><p className="truncate font-semibold">{user?.name}</p><p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p><p className="mt-1 text-xs">{roles.find(r=>r.id===user?.role)?.name} <span className="rounded bg-amber-100 px-1 text-amber-800">DEMO</span></p></div></div>
   <Link className={row} to="/profile/overview"><UserRound size={17}/><T text={"My Profile"}/></Link>
   <Link className={row} to="/account/account"><Settings size={17}/><T text={"Account settings"}/></Link>
   <Link className={row} to="/account/security"><ShieldCheck size={17}/><T text={"Security"}/></Link>
   <Can permission="settings:manage"><Link className={row} to="/settings/pos"><Settings size={17}/><T text={"POS Settings"}/></Link></Can>
   <Can permission="staff:view"><Link className={row} to="/staff/staff-list"><Users size={17}/><T text={"Staff Management"}/></Link></Can>
   <div className="my-2 border-t border-slate-100 dark:border-slate-700"/>
   <button className={row} onClick={guideService.start}><BookOpen size={17}/><T text={"Show demo guide"}/></button>
   <Link className={row} to="/coming-soon"><Rocket size={17}/><T text={"What's new?"}/></Link>
   <Link className={row} to="/help-center"><Headset size={17}/><T text={"Get help"}/></Link>
   <button className={row} onClick={()=>setProfile(true)}><UserRound size={17}/><T text={"Profile details"}/></button>
   <RoleSwitcher/><InstallButton/>
   <button className={row} onClick={()=>{try{authService.logout();navigate('/sign-in');}catch(error){setError(error instanceof Error?error.message:'Unable to sign out.');}}}><LogOut size={17}/><T text={"Log Out"}/></button>
   {error&&<p role="alert" className="p-3 text-red-500">{error}</p>}
  </div>
 </Popover><Drawer open={profile} title="My profile" onClose={()=>setProfile(false)}><Avatar name={user?.name??'Demo user'} imageId={user?.avatarId} size="mb-5 h-20 w-20"/><dl className="space-y-4"><div><dt><T text={"Name"}/></dt><dd>{user?.name}</dd></div><div><dt><T text={"Email"}/></dt><dd>{user?.email}</dd></div><div><dt><T text={"Role"}/></dt><dd>{roles.find(r=>r.id===user?.role)?.name}</dd></div><div><dt><T text={"Branches"}/></dt><dd>{user?.branchIds.join(', ')}</dd></div><div><dt><T text={"Status"}/></dt><dd>{user?.status}</dd></div></dl><Link className="btn mt-6" to="/auth/account-deactivation"><T text={"Deactivate account"}/></Link></Drawer></>;
}
