import { useToasts, dismissToast } from "../../services/toastService";
export function Toast() {
  const items = useToasts();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-5 right-5 z-[100] flex max-w-sm flex-col gap-2"
    >
      {items.map((t) => (
        <div
          key={t.id}
          role={t.kind === "error" ? "alert" : "status"}
          className={`flex items-center gap-4 rounded-lg border bg-white p-4 shadow-lg dark:bg-slate-800 ${t.kind === "error" ? "border-red-400" : t.kind === "success" ? "border-emerald-400" : "border-indigo-400"}`}
        >
          <span>{t.message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => dismissToast(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
