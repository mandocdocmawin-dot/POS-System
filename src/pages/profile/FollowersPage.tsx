import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Mail, UserPlus, Users } from 'lucide-react';
import { ProfileShell } from '../../components/profile/ProfileShell';
import { Avatar } from '../../components/common/Avatar';
import { profileService } from '../../services/profileService';
import { profileWorkspaceService } from '../../services/profileWorkspaceService';
import { useContentStore } from '../../store/useContentStore';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { usePermission } from '../../hooks/usePermission';
import { useAction } from '../../hooks/useAction';
export function Component() {
  const { staffId } = useParams(), user = profileService.get(staffId), current = useCurrentUser()!, { can } = usePermission(), action = useAction();
  const follows = useContentStore(s=>s.follows) ?? {}, [query,setQuery]=useState(''), [view,setView]=useState('colleagues');
  const people=profileWorkspaceService.people().filter(p=>p.id!==user.id), followers=people.filter(p=>follows[p.id]?.includes(user.id)), following=people.filter(p=>follows[user.id]?.includes(p.id));
  const rows=(view==='followers'?followers:view==='following'?following:people).filter(p=>`${p.name} ${p.email} ${p.position??''}`.toLowerCase().includes(query.toLowerCase()));
  return <ProfileShell>{action.feedback}<div className="flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap gap-2">{[['colleagues','Colleagues'],['followers',`Followers (${followers.length})`],['following',`Following (${following.length})`]].map(([id,label])=><button className={`btn ${view===id?'menu-active':''}`} aria-pressed={view===id} onClick={()=>setView(id)} key={id}>{label}</button>)}</div><label><span className="sr-only">Search people</span><input placeholder="Search people…" value={query} onChange={e=>setQuery(e.target.value)}/></label></div><div className="grid gap-4 xl:grid-cols-2">{rows.map(person=><article className="card flex flex-wrap items-center gap-4" key={person.id}><Avatar name={person.name} imageId={person.avatarId} size="h-16 w-16"/><div className="min-w-0 flex-1"><h2 className="font-semibold">{person.name}</h2><p className="mt-1 text-xs capitalize">{person.position||person.role}</p><p className="mt-2 flex items-center gap-2 break-all text-sm"><Mail size={14}/>{person.email}</p>{can('staff:view')&&<Link className="mt-2 inline-block text-sm text-indigo-600 dark:text-indigo-300" to={`/profile/${person.id}/overview`}>View profile →</Link>}</div>{person.id!==current.id&&<button className={`btn ${follows[current.id]?.includes(person.id)?'menu-active':''}`} aria-pressed={!!follows[current.id]?.includes(person.id)} onClick={()=>{void action.run(()=>profileWorkspaceService.follow(person.id));}}><UserPlus size={15}/>{follows[current.id]?.includes(person.id)?'Following':'Follow'}</button>}</article>)}</div>{!rows.length&&<div className="card py-12 text-center"><Users className="mx-auto mb-3 text-indigo-500"/><h2 className="font-semibold">No people in this view</h2><p className="mt-2">Follow colleagues to build your local workspace network.</p></div>}</ProfileShell>;
}
