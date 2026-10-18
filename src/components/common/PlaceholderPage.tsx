import { Construction, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../layout/PageHeader";
export interface PlaceholderPageProps {
  title: string;
  description: string;
  breadcrumb: string[];
  plannedFeatures: string[];
  status?: "placeholder" | "in-progress" | "done";
}
export function PlaceholderPage({
  title,
  description,
  breadcrumb,
  plannedFeatures,
  status = "placeholder",
}: PlaceholderPageProps) {
  return (
    <>
      <PageHeader title={title} breadcrumb={breadcrumb} /><Link className="btn mt-4" to="/coming-soon">See the roadmap →</Link>
      <section className="card mx-auto mt-10 max-w-3xl border-dashed px-6 py-14 md:px-14">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15">
          <Construction size={28} />
        </div>
        <div className="text-center">
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            {status === "placeholder"
              ? "Not started"
              : status === "in-progress"
                ? "In progress"
                : "Complete"}
          </span>
          <h2 className="mb-3 mt-5 text-xl font-semibold">
            Coming soon: {title}
          </h2>
          <p className="mx-auto max-w-md text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-md rounded-xl bg-slate-50 p-5 dark:bg-slate-800/60">
          <h3 className="mb-4 text-xs font-semibold">Planned features</h3>
          <ul className="space-y-4">
            {plannedFeatures.map((feature) => (
              <li key={feature}>
                <label className="flex items-start gap-3 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={false}
                    readOnly
                    disabled
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-slate-300"
                  />
                  {feature}
                </label>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 text-center">
          <Link to="/" className="btn">
            Back to Dashboard <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
