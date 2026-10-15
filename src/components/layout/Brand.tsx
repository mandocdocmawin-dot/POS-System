import { Link } from "react-router-dom";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="TindaPOS dashboard"
      className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-xl font-black text-white shadow-sm">
        T<span className="text-teal-300">.</span>
      </span>
      {!compact && (
        <span>
          Tinda<span className="text-indigo-600 dark:text-indigo-400">POS</span>
        </span>
      )}
    </Link>
  );
}
