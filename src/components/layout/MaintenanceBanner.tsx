import { useSettings } from '../../hooks/useSettings';
import { settingsService } from '../../services/settingsService';
import { useAction } from '../../hooks/useAction';
export function MaintenanceBanner() {
  const general = useSettings(s => s.general), action = useAction();
  if (!general.maintenanceMode) return null;
  return <aside role="status" className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 bg-amber-200 px-5 py-3 text-amber-950"><p>Maintenance mode is on. Other users are redirected to the maintenance page.</p><button className="btn" disabled={action.busy} onClick={() => { void action.run(() => settingsService.save('general', { ...general, maintenanceMode: false }), 'Maintenance mode turned off'); }}>Turn off</button>{action.feedback}</aside>;
}
