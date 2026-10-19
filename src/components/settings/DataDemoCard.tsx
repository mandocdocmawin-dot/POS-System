import { T } from "../../i18n/T";
import {backupService} from '../../services/backupService';
import {demoHistoryService} from '../../services/demoHistoryService';
import { useState } from "react";
import { usePermission } from "../../hooks/usePermission";
import { ConfirmDialog } from "../../components/common/ConfirmDialog";
import { dataService } from "../../services/dataService";
import { toast, errorMessage } from "../../services/toastService";
import { downloadFile } from "../../utils/csv";
export function DataDemoCard() {
  const {can}=usePermission();
  const [pending, setPending] = useState<string>();
  const [reset, setReset] = useState(false);const [history,setHistory]=useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>

      <fieldset disabled={!can("settings:manage")}><section className="card mt-6 space-y-4">
        <h2 className="text-base font-semibold"><T text={"Data"}/></h2><button className="btn" disabled={busy||demoHistoryService.generated()} onClick={()=>setHistory(true)}>{demoHistoryService.generated()?"Demo history generated":"Generate demo history"}</button>
        <p className="text-sm text-slate-500">
          Demo data is stored in this browser. JSON backups include product
          images, staff avatars, roles, attendance, holidays, shifts, payroll, the demo session, customers, orders, held orders and the open cart. Import and reset
          replace all current local business data, including calendar, chat, mail, tickets, plans, notes and preferences. Document files are NOT exported; metadata only. Imported documents require re-upload.
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
                  await backupService.export(),
                  "application/json",
                );
                toast.success("Data exported");
              } catch (e) {
                setError(errorMessage(e));
              } finally {
                setBusy(false);
              }
            }}
          ><T text={"Export data (JSON)"}/></button>
          <label className="btn cursor-pointer"><T text={"Import data (JSON)"}/><input
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
          ><T text={"Reset demo data"}/></button>
        </div>
        {busy && <p role="status"><T text={"Preparing backup…"}/></p>}
        {error && (
          <p role="alert" className="break-words text-red-500">
            {error}
          </p>
        )}
      </section></fieldset>
      <ConfirmDialog open={history} title="Generate 90 days of demo history?" message="This adds realistic sales, supplier purchases and payments, refunds and manual expenses using the real services. It runs once until data is reset." onClose={()=>setHistory(false)} onConfirm={()=>{const result=demoHistoryService.generate();toast.success(`Generated ${result.orders} orders and ${result.purchases} purchases`);}}/>
      {pending && (
        <ConfirmDialog
          open
          title="Replace current data?"
          message="The JSON structure and relationships are valid. Import replaces all business and staff records, payroll snapshots, roles, avatars and the demo session."
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
          message="This replaces all business and staff records with demo data, resets roles and payroll runs, clears the cart and signs you out."
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
