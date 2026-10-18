import { Link, useRouteError } from 'react-router-dom';
import { useAction } from '../../hooks/useAction';
import { recoveryService } from '../recoveryService';
import { useEffect } from 'react';
import { errorLogService } from '../../services/errorLogService';
export function RouteErrorPage() {
  const error=useRouteError(),action=useAction(),details=error instanceof Error?`${error.message}\n${error.stack??''}`:JSON.stringify(error,null,2);
  useEffect(()=>{errorLogService.record(error);},[error]);
  return <main id="main-content" tabIndex={-1} className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-5 p-6"><p className="text-5xl font-bold">500</p><h1 className="text-2xl font-semibold">This page could not be displayed</h1><p>Your browser records have not been reset. Download a backup before trying a reset.</p>{action.feedback}<div className="flex flex-wrap gap-3"><button className="btn-primary" onClick={()=>location.reload()}>Reload</button><Link className="btn" to="/">Go to Dashboard</Link><button className="btn" onClick={()=>{void action.run(()=>recoveryService.download());}}>Download data backup</button></div><details><summary className="cursor-pointer">Technical details</summary><pre className="mt-4 overflow-auto whitespace-pre-wrap rounded border p-4 text-xs dark:border-slate-700">{details}</pre><button className="btn mt-3" onClick={()=>{void action.run(()=>navigator.clipboard.writeText(details),'Details copied');}}>Copy details</button></details></main>;
}
