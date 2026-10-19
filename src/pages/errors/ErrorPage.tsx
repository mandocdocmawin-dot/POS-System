import { T } from "../../i18n/T";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, SearchX, TriangleAlert } from "lucide-react";
export function Component() {
  const { pathname } = useLocation();
  const server = pathname === "/errors/500";
  const Icon = server ? TriangleAlert : SearchX;
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center py-12 text-center">
      <span className="mb-4 rounded-2xl bg-indigo-50 p-4 text-indigo-500 dark:bg-indigo-500/10">
        <Icon size={30} />
      </span>
      <p className="text-[100px] font-bold leading-tight tracking-tighter text-indigo-600 dark:text-indigo-400">
        {server ? "500" : "404"}
      </p>
      <h1 className="mt-3 text-2xl font-semibold">
        {server ? "Something went wrong" : "This page wandered off"}
      </h1>
      <p className="mb-8 mt-3 text-sm leading-6 text-slate-400">
        {server
          ? "We hit a little snag. Head back to your dashboard and give it another try."
          : "The page you are looking for may have moved, or the address may be incorrect."}
      </p>
      <Link to="/" className="btn-primary">
        <ArrowLeft size={15} /><T text={"Back to Dashboard"}/></Link>
    </section>
  );
}
