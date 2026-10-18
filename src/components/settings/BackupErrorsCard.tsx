import { useState } from 'react';
import { useLocalData } from '../../services/useLocalData';
import { errorLogService } from '../../services/errorLogService';
import { backupService } from '../../services/backupService';
import { downloadFile } from '../../utils/csv';
import { useAction } from '../../hooks/useAction';
import { ConfirmDialog } from '../common/ConfirmDialog';
export function BackupErrorsCard() {
  useLocalData(); const action = useAction(), [clear, setClear] = useState(false), errors = errorLogService.list();
  return <section className="card mt-6 space-y-4"><h2 className="text-lg font-semibold">Backups and recent errors</h2>{action.feedback}<p>Last backup: {backupService.lastBackup() ? new Date(backupService.lastBackup()!).toLocaleString() : 'Never'}</p>{backupService.overdue() && <p role="status" className="text-amber-700 dark:text-amber-300">Export a backup now. Backups are recommended at least every 7 days.</p>}<p>Document contents are not included in JSON backups. Download important files separately.</p><button className="btn-primary" disabled={action.busy} onClick={() => { void action.run(async () => downloadFile('tindapos-backup.json', await backupService.export(), 'application/json'), 'Backup downloaded'); }}>Export backup</button><h3 className="font-semibold">Recent errors ({errors.length}/50)</h3><ul className="max-h-72 space-y-3 overflow-auto">{errors.map(error => <li className="break-words rounded border p-3 dark:border-slate-700" key={error.id}><p>{error.message}</p><p className="text-xs">{new Date(error.createdAt).toLocaleString()} · {error.route}</p><details><summary>Technical details</summary><pre className="overflow-x-auto whitespace-pre-wrap text-xs">{error.stack || 'No stack available.'}</pre></details></li>)}</ul>{!errors.length && <p>No recent errors.</p>}<button className="btn" disabled={!errors.length} onClick={() => setClear(true)}>Clear recent errors</button><ConfirmDialog open={clear} title="Clear recent errors?" message="Remove the saved local error log?" onClose={() => setClear(false)} onConfirm={errorLogService.clear} /></section>;
}
