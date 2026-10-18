import {Link} from 'react-router-dom';
export function EntityLink({type,id,children}:{type:'orders'|'customers'|'suppliers'|'purchases'|'payroll';id:string;children:React.ReactNode}){return <Link className="font-medium text-indigo-600 hover:underline dark:text-indigo-300" to={type==='payroll'?`/staff/payroll?run=${encodeURIComponent(id)}`:`/${type}/${id}`}>{children}</Link>;}
