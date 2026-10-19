import type {ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {Info,Users,UserCheck,Crown,UserPlus,UserX} from 'lucide-react';
import '../../styles/commerce.css';

export function CommerceWorkspace({title,section,children}:{title:string;section:'Orders'|'Customers'|'Suppliers'|'Purchases'|'Accounts'|'Reports';children:ReactNode}) {
 const paths={Orders:'/orders/all-orders',Customers:'/customers/customer-list',Suppliers:'/suppliers/supplier-list',Purchases:'/purchases/purchase',Accounts:'/accounts/income',Reports:'/reports/sales'};
 return <section className="commerce-workspace"><header className="commerce-page-heading"><h1>{title}</h1><nav aria-label="Breadcrumb"><Link to={paths[section]}>{section}</Link><span>›</span><span>{title}</span></nav></header>{children}</section>;
}
export function CommerceStats({items,customers=false}:{items:{label:string;value:ReactNode;detail:string}[];customers?:boolean}) {
 const icons=[Users,UserCheck,Crown,UserPlus,UserX];
 return <div className="commerce-stats">{items.map((item,i)=>{const Icon=icons[i%icons.length];return <article className="panel commerce-stat" key={item.label}><div>{customers&&<span className={`commerce-stat-icon tone-${i}`}><Icon size={20}/></span>}<h2>{item.label}</h2>{!customers&&<Info size={17} className="commerce-muted"/>}</div><strong>{item.value}</strong><small>{item.detail}</small></article>;})}</div>;
}
export function CommercePanelHeading({title,subtitle,children}:{title:string;subtitle?:string;children?:ReactNode}) {
 return <div className="commerce-panel-heading"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><div className="commerce-toolbar">{children}</div></div>;
}
