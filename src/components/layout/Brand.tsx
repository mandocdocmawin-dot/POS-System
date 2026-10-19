import { Link } from "react-router-dom";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      to="/"
      aria-label="TindaPOS dashboard"
      className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 dark:text-white"
    >
      <img
        src={`${import.meta.env.BASE_URL}logo.svg`}
        width={36}
        height={36}
        className="h-9 w-9 shrink-0"
        alt=""
      />
      {!compact && (
        <span>
          Tinda<span className="text-indigo-600 dark:text-indigo-400">POS</span>
        </span>
      )}
    </Link>
  );
}
