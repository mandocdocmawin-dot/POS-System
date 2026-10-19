import { useLanguageStore } from '../../store/useLanguageStore';
import { T } from "../../i18n/T";
import { useState } from 'react';
import {FeaturePage} from '../../components/common/FeaturePage';
import {useAction} from '../../hooks/useAction';
import {accountTabs} from '../../config/accountTabs';
import { profileService } from '../../services/profileService';
import { usePermission } from '../../hooks/usePermission';
import { ImageUpload } from '../../components/forms/ImageUpload';
import { imageService } from '../../services/imageService';
export function Component() {
  const { language, setLanguage } = useLanguageStore();
  const user = profileService.get(), [draft, setDraft] = useState({ name: user.name, email: user.email, phone: user.phone ?? '', avatarId: user.avatarId, defaultBranchId:user.defaultBranchId??user.branchIds[0],languageLabel:language==='fil'?'Filipino':'English' }), action = useAction(), { can } = usePermission();
  return <FeaturePage title="My account" description="Manage your local demo identity." tabs={can('billing:view') ? [...accountTabs, ['Billing & plans', '/account/billing-plans']] : accountTabs}>{action.feedback}<form data-store-key="tindapos:staff" data-record-id={user.id} className="card grid max-w-3xl gap-5 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void action.run(() => profileService.saveOwn({...draft,languageLabel:language==='fil'?'Filipino':'English'}), 'Account saved'); }}>{(['name', 'email', 'phone'] as const).map(key => <label key={key} className="grid gap-2 capitalize"><T>{key}</T><input readOnly={key==='email'} required={key !== 'phone'} type={key === 'email' ? 'email' : 'text'} value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} /></label>)}<div><p className="text-sm"><T text={"Role: "}/>{user.role}</p><p className="mt-2"><T text={"Staff number: "}/>{user.staffNo}</p><p className="mt-2">Branches: {user.branchIds.join(', ')}</p></div><label className="grid gap-2"><T text="Preferred language"/><select value={language==='fil'?'Filipino':'English'} onChange={e=>{void setLanguage(e.target.value==='Filipino'?'fil':'en');}}><option>English</option><option>Filipino</option></select></label><label className="grid gap-2"><T text={"Default branch"}/><select value={draft.defaultBranchId} onChange={e=>setDraft({...draft,defaultBranchId:e.target.value})}>{user.branchIds.map(branch=><option key={branch}>{branch}</option>)}</select></label><ImageUpload label="Avatar" onChange={blob => { if (blob) void action.run(async () => { const avatarId = await imageService.save(blob); setDraft(d => ({ ...d, avatarId })); }); else setDraft(d => ({ ...d, avatarId: undefined })); }} /><div className="sm:col-span-2"><button className="btn-primary" disabled={action.busy}><T text={"Save account"}/></button></div></form></FeaturePage>;
}
