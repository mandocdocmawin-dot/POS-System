import { T } from "../../i18n/T";
import {Link} from 'react-router-dom';
import {authService} from '../../services/authService';
export function ForbiddenPage(){const path=authService.firstPath();return <section className="mx-auto max-w-xl p-10 text-center"><p className="text-sm font-semibold text-indigo-500">403</p><h1 className="my-4 text-3xl font-semibold"><T text={"No access"}/></h1><p className="mb-6 text-slate-500"><T text={"Your role does not have permission to open this page."}/></p><div className="flex justify-center gap-3"><button className="btn" onClick={()=>history.back()}><T text={"Go back"}/></button><Link className="btn-primary" to={path==='/403'?'/sign-in':path}>Go to an accessible page</Link></div></section>;}
