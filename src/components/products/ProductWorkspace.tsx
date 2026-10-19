import type {ReactNode} from 'react';
import {ChevronRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import '../../styles/products.css';
export function ProductWorkspace({title,children,section='Products',basePath='/products'}:{title:string;children:ReactNode;section?:string;basePath?:string}) {
 return <div className="product-workspace"><header className="product-page-heading"><h1>{title}</h1><nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500"><Link to={basePath}>{section}</Link><ChevronRight size={14}/><span aria-current="page" className="text-slate-800 dark:text-slate-200">{title}</span></nav></header>{children}</div>;
}
export function CatalogStatus({status}:{status:string}) {return <span className={`catalog-status ${['active','Published','Active','Success','Posted','Increase','received','Open'].includes(status)?'positive':['inactive','Hidden','Expired','Failed','Decrease','cancelled','Out of stock','Critical'].includes(status)?'negative':'pending'}`}>{status.replaceAll('_',' ')}</span>;}
