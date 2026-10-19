import { T } from "../../i18n/T";
import { ChevronRight } from "lucide-react";
export function PageHeader({
  title,
  breadcrumb,
  children,
}: {
  title: string;
  breadcrumb: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight"><T>{title}</T></h1>
        {children}
      </div>
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          {breadcrumb.map((text, i) => (
            <li key={`${text}-${i}`} className="flex items-center gap-2">
              {i > 0 && <ChevronRight size={12} />}
              <span
                aria-current={i === breadcrumb.length - 1 ? "page" : undefined}
                className={
                  i === breadcrumb.length - 1
                    ? "font-medium text-slate-600 dark:text-slate-300"
                    : ""
                }
              >
                <T>{text}</T>
              </span>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}
