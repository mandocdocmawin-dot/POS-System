import { T } from "../../i18n/T";
import {FeaturePage} from '../../components/common/FeaturePage';
import {useAction} from '../../hooks/useAction';
import {accountTabs} from '../../config/accountTabs';
import { useLocalData } from '../../services/useLocalData';
import { notificationService } from '../../services/notificationService';
import { notificationTypes } from '../../types/phase8';
export function Component() {
  useLocalData(); const prefs = notificationService.prefs(), action = useAction();
  return <FeaturePage title="Notification preferences" tabs={accountTabs} description="Local demo notifications only. No push notifications or external delivery.">{action.feedback}<section className="card grid gap-4 sm:grid-cols-2">{notificationTypes.map(type => <label className="flex items-center gap-3" key={type}><input type="checkbox" checked={prefs.types[type]} onChange={e => { void action.run(() => notificationService.savePrefs({ ...prefs, types: { ...prefs.types, [type]: e.target.checked } })); }} /><span className="capitalize">{type.replaceAll('_', ' ')}</span></label>)}</section><section className="card space-y-4"><h2 className="text-lg font-semibold">Chat simulation</h2><label className="flex items-center gap-3"><input type="checkbox" checked={prefs.autoReply} onChange={e => { void action.run(() => notificationService.savePrefs({ ...prefs, autoReply: e.target.checked })); }} />Enable automatic demo replies</label><button className="btn" onClick={() => { void action.run(() => notificationService.markAll(), 'Notifications marked as read'); }}><T text={"Mark everything as read"}/></button></section></FeaturePage>;
}
