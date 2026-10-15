import { useState } from "react";
import { Component as GeneralPlaceholder } from "../misc/RoutePage";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { dataService } from "../../services/dataService";
import { toast, errorMessage } from "../../services/toastService";
import { downloadFile } from "../../utils/csv";
export function Component() {
  const [pending, setPending] = useState<string>();
  const [reset, setReset] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <GeneralPlaceholder />
      <section className="card mt-6 space-y-4">
        <h2 className="text-base font-semibold">Data</h2>
        <p className="text-sm text-slate-500">
          Demo data is stored in this browser. JSON backups include product
          images. Import and reset replace your current products and stock
          history.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="btn"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                downloadFile(
                  "tindapos-backup.json",
                  await dataService.export(),
                  "application/json",
                );
                toast.success("Data exported");
              } catch (e) {
                setError(errorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          >
            Export data (JSON)
          </button>
          <label className="btn cursor-pointer">
            Import data (JSON)
            <input
              className="sr-only"
              type="file"
              accept="application/json,.json"
              disabled={busy}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setError("");
                try {
                  if (file.size > 50 * 1024 * 1024)
                    throw new Error("Backup must be smaller than 50 MB.");
                  const text = await file.text();
                  dataService.validate(text);
                  setPending(text);
                } catch (e) {
                  setError(errorMessage(e));
                }
              }}
            />
          </label>
          <button
            className="btn text-red-500"
            disabled={busy}
            onClick={() => setReset(true)}
          >
            Reset demo data
          </button>
        </div>
        {busy && <p role="status">Preparing backup…</p>}
        {error && (
          <p role="alert" className="break-words text-red-500">
            {error}
          </p>
        )}
      </section>
      {pending && (
        <ConfirmDialog
          open
          title="Replace current data?"
          message="The JSON structure and relationships are valid. Import will replace your catalog, products and stock movements."
          onClose={() => setPending(undefined)}
          onConfirm={async () => {
            await dataService.import(pending);
            toast.success("Data imported");
          }}
        />
      )}
      {reset && (
        <ConfirmDialog
          open
          title="Reset demo data?"
          message="This replaces your current catalog, products and stock history with the original demo data."
          onClose={() => setReset(false)}
          onConfirm={() => {
            dataService.reset();
            toast.success("Demo data reset");
          }}
        />
      )}
    </>
  );
}
