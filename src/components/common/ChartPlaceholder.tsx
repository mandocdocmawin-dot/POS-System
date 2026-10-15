export function ChartPlaceholder({
  height = "h-44",
  donut = false,
}: {
  height?: string;
  donut?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label="Chart placeholder, visualization planned for a later phase"
      className={`relative mt-5 flex items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-800/30 ${height}`}
    >
      <div
        className={
          donut
            ? "flex h-28 w-28 items-center justify-center rounded-full border-[18px] border-slate-200 dark:border-slate-700"
            : ""
        }
      >
        <span className="text-[10px] text-slate-400">Chart placeholder</span>
      </div>
    </div>
  );
}
