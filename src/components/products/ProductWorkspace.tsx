import type {ReactNode} from 'react';
import {ChevronRight} from 'lucide-react';
import {Link} from 'react-router-dom';
import '../../styles/products.css';
export function ProductWorkspace({title,children}:{title:string;children:ReactNode}) {
 return <div className="product-workspace"><header className="product-page-heading"><h1>{title}</h1><nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500"><Link to="/products">Products</Link><ChevronRight size={14}/><span aria-current="page" className="text-slate-800 dark:text-slate-200">{title}</span></nav></header>{children}</div>;
}
export function CatalogStatus({status}:{status:string}) {return <span className={`catalog-status ${['active','Published','Active','Success'].includes(status)?'positive':['inactive','Hidden','Expired','Failed'].includes(status)?'negative':'pending'}`}>{status}</span>;}
