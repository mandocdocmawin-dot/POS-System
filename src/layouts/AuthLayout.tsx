import { T } from "../i18n/T";
import {usePageTitle} from '../hooks/usePageTitle';
import { Outlet, Link } from "react-router-dom";
import { Brand } from "../components/layout/Brand";
export function AuthLayout() {
 usePageTitle();
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50 px-4 py-12 dark:from-indigo-950 dark:via-slate-950 dark:to-slate-900">
      <div className="mb-8">
        <Brand />
      </div>
      <main id="main-content" tabIndex={-1} className="card w-full max-w-md p-7 sm:p-9">
        <Outlet />
      </main>
      <p className="mt-7 text-center text-xs text-slate-400"><T text={"Made for your everyday business."}/>{" "}
        <Link className="text-indigo-500" to="/help-center"><T text={"Need help?"}/></Link>
      </p>
      <p className="mt-4 text-xs text-slate-400">
        © 2026 TindaPOS · Frontend demo
      </p>
    </div>
  );
}
