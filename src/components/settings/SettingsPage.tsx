import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useBlocker } from 'react-router-dom';
import type { Settings, SettingsSection } from '../../types/settings';
import { useSettings } from '../../hooks/useSettings';
import { usePermission } from '../../hooks/usePermission';
import { settingsService } from '../../services/settingsService';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate, formatTime } from '../../utils/date';
import { toast } from '../../services/toastService';
export function SettingsPage<K extends SettingsSection>({ section, title, children, extra }: { section: K; title: string; children: (value: Settings[K], change: (value: Settings[K]) => void) => ReactNode; extra?: ReactNode }) {
 const saved = useSettings(s => s[section]);
 const [draft, setDraft] = useState<Settings[K]>(() => structuredClone(saved));
 const [confirm, setConfirm] = useState<'save'|'reset'>();
 const { can } = usePermission(); const writable = can('settings:manage');
 const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
 const blocker = useBlocker(dirty && writable);
 useEffect(() => { const handler = (event: BeforeUnloadEvent) => { if (dirty && writable) {event.preventDefault();event.returnValue='';} }; window.addEventListener('beforeunload',handler);return () => window.removeEventListener('beforeunload',handler); },[dirty,writable]);
 const meta = settingsService.metadata();
 return <div className="space-y-6 pb-24"><header><p className="text-sm text-slate-500">Workspace settings</p><h1 className="text-2xl font-semibold">{title}</h1></header>
 <nav aria-label="Settings sections" className="flex flex-wrap gap-2">{['general','tax','currencies','invoices','pos','payment-gateway','manager','coupons'].map(path => <NavLink key={path} className={({isActive}) => isActive ? 'btn-primary' : 'btn'} to={`/settings/${path}`}>{path.replaceAll('-',' ')}</NavLink>)}</nav>
 {!writable && <p className="card border-amber-300" role="status">Read-only access. An administrator can change these settings.</p>}
 <fieldset disabled={!writable} className="space-y-6">{children(draft,setDraft)}<button className="btn text-red-500" type="button" onClick={() => setConfirm('reset')}>Reset this section to defaults</button></fieldset>
 {extra}
 <p className="text-xs text-slate-500">{meta.updatedAt ? `Last updated by ${meta.updatedBy} on ${formatDate(meta.updatedAt)} ${formatTime(meta.updatedAt)}` : 'Using default settings'}</p>
 {dirty && writable && <div className="sticky bottom-0 z-20 flex justify-end gap-3 rounded-xl border bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-900"><button className="btn" onClick={() => setDraft(structuredClone(saved))}>Discard</button><button className="btn-primary" onClick={() => setConfirm('save')}>Save changes</button></div>}
 <ConfirmDialog open={confirm==='save'} title="Save settings?" message={settingsService.preview(section,draft).join('\n')} onClose={() => setConfirm(undefined)} onConfirm={() => { settingsService.save(section,draft);toast.success('Settings saved'); }} />
 <ConfirmDialog open={confirm==='reset'} title="Reset this section?" message="Defaults will replace your edits. Review and save to apply." onClose={() => setConfirm(undefined)} onConfirm={() => setDraft(settingsService.defaults(section))} />
 <ConfirmDialog open={blocker.state==='blocked'} title="Discard unsaved changes?" message="Your edits have not been saved." onClose={() => { if(blocker.state==='blocked')blocker.reset(); }} onConfirm={() => { if(blocker.state==='blocked')blocker.proceed(); }} />
 </div>;
}
export function SettingsCard({ title, children }: { title: string; children: ReactNode }) {return <section className="card space-y-4"><h2 className="text-lg font-semibold">{title}</h2><div className="grid gap-4 md:grid-cols-2">{children}</div></section>;}
