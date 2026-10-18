import {Bell,AlertTriangle} from 'lucide-react';
import {Link} from 'react-router-dom';
import {useEffect,useState} from 'react';
import {Popover} from '../common/Popover';
import {Avatar} from '../common/Avatar';
import {notificationService} from '../../services/notificationService';
import {useLocalData} from '../../services/useLocalData';
export function NotificationMenu(){
 useLocalData();const [now,setNow]=useState(()=>new Date()),[unreadOnly,setUnreadOnly]=useState(false);
 useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(timer);},[]);
 const items=notificationService.list(now),unread=items.filter(n=>!n.readAt).length,visible=unreadOnly?items.filter(n=>!n.readAt):items;
 return <Popover label={`Notifications, ${unread} unread`} trigger={<span className="relative"><Bell size={17}/>{unread>0&&<span className="absolute -right-2 -top-2 rounded-full bg-orange-600 px-1 text-[10px] text-white">{unread}</span>}</span>}>
  <section className="w-[min(25rem,calc(100vw-3.5rem))]"><header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-700"><h2 className="text-sm font-semibold">Notifications ({items.length})</h2><div className="flex gap-1">{['All','Unread'].map((label,index)=><button key={label} aria-pressed={unreadOnly===(index===1)} className={`rounded px-2 py-1 text-xs ${unreadOnly===(index===1)?'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200':'text-slate-500'}`} onClick={e=>{e.stopPropagation();setUnreadOnly(index===1);}}>{label}</button>)}</div></header>
   <div aria-live="polite" className="max-h-[55dvh] overflow-y-auto">{visible.map(n=><article className="flex gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-700" key={n.key}><span className="relative shrink-0"><Avatar name={`Demo ${n.type}`} size="h-10 w-10"/>{n.severity==='critical'&&<AlertTriangle size={13} className="absolute -bottom-1 right-0 rounded-full bg-white text-red-600 dark:bg-slate-900" aria-label="Critical"/>}</span><Link className="min-w-0 flex-1" to={n.link} onClick={()=>notificationService.mark(n.key)}><div className="flex items-center gap-2"><p className="flex-1 text-sm font-semibold">{n.title}</p>{!n.readAt&&<span className="h-2 w-2 shrink-0 rounded-full bg-teal-600" aria-label="Unread"/>}</div><p className="mt-1 text-xs leading-relaxed text-slate-500">{n.body}</p></Link><button className="self-start px-1 text-slate-500" aria-label={`Dismiss ${n.title}`} onClick={e=>{e.stopPropagation();notificationService.mark(n.key,true);}}>×</button></article>)}{!visible.length&&<p className="px-4 py-10 text-center text-sm text-slate-500">{unreadOnly?'No unread notifications.':'You are all caught up.'}</p>}</div>
   <footer className="flex items-center justify-between gap-3 p-3 text-xs"><button className="text-indigo-600 underline" onClick={e=>{e.stopPropagation();notificationService.markAll();}}>Mark all as read</button><Link to="/account/notification">Preferences →</Link></footer><p className="px-3 pb-3 text-[10px] text-slate-500">Demo notifications · sample portraits</p>
  </section>
 </Popover>;
}
