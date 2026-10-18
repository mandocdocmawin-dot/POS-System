import {NavLink} from 'react-router-dom';
export function WorkspaceHeader({title,description,links}:{title:string;description:string;links:[string,string][]}){
 return <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-lg font-semibold">{title}</h1><p className="mt-1 text-xs text-slate-500">{description}</p></div><nav aria-label={`${title} views`} className="flex gap-1">{links.map(([label,path])=><NavLink key={path} to={path} className={({isActive})=>`rounded-lg px-3 py-2 text-xs ${isActive?'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200':'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>{label}</NavLink>)}</nav></header>;
}
