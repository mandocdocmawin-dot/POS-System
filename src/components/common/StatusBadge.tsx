const tones = {
  green:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  red: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300",
  slate: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
};
export function StatusBadge({ children }: { children: string }) {
  const tone = ["Paid", "Active", "Completed"].includes(children)
    ? "green"
    : ["Pending", "Not started"].includes(children)
      ? "amber"
      : ["Failed", "Deleted", "Cancelled"].includes(children)
        ? "red"
        : "slate";
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
