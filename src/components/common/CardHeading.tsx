import { MoreHorizontal } from "lucide-react";
import { Popover } from "./Popover";
import { Link } from "react-router-dom";
export function CardHeading({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-[13px] font-semibold">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-[10px] text-slate-400">{subtitle}</p>
        )}
      </div>
      {children ?? (
        <Popover
          label={`${title} options`}
          className="text-slate-400 hover:text-indigo-500"
          trigger={<MoreHorizontal size={18} />}
        >
          <Link
            to="/reports/sales"
            className="block w-36 rounded-lg px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            View sales report
          </Link>
        </Popover>
      )}
    </div>
  );
}
export function PeriodSelect({
  label,
  options = ["Recent", "This week", "This month"],
}: {
  label: string;
  options?: string[];
}) {
  return (
    <select
      aria-label={label}
      className="py-1.5 text-[10px]"
      defaultValue={options[0]}
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}
