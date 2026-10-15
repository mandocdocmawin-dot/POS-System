import { Outlet, Link } from "react-router-dom";
import { Brand } from "../components/layout/Brand";
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-slate-50 to-teal-50 px-4 py-12 dark:from-indigo-950 dark:via-slate-950 dark:to-slate-900">
      <div className="mb-8">
        <Brand />
      </div>
      <main className="card w-full max-w-md p-7 sm:p-9">
        <Outlet />
      </main>
      <p className="mt-7 text-center text-[11px] text-slate-400">
        Made for your everyday business.{" "}
        <Link className="text-indigo-500" to="/help-center">
          Need help?
        </Link>
      </p>
      <p className="mt-4 text-[10px] text-slate-400">
        © 2026 TindaPOS · Frontend demo
      </p>
    </div>
  );
}
