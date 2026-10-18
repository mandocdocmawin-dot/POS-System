import { useState } from 'react';
import { FeaturePage, useAction, accountTabs } from '../../components/common/FeaturePage';
import { profileService } from '../../services/profileService';
import { usePermission } from '../../hooks/usePermission';
import { ImageUpload } from '../../components/forms/ImageUpload';
import { imageService } from '../../services/imageService';
export function Component() {
  const user = profileService.get(), [draft, setDraft] = useState({ name: user.name, email: user.email, phone: user.phone ?? '', avatarId: user.avatarId }), action = useAction(), { can } = usePermission();
  return <FeaturePage title="My account" description="Manage your local demo identity." tabs={can('billing:view') ? [...accountTabs, ['Billing & plans', '/account/billing-plans']] : accountTabs}>{action.feedback}<form className="card grid max-w-3xl gap-5 sm:grid-cols-2" onSubmit={e => { e.preventDefault(); void action.run(() => profileService.saveOwn(draft), 'Account saved'); }}>{(['name', 'email', 'phone'] as const).map(key => <label key={key} className="grid gap-2 capitalize">{key}<input required={key !== 'phone'} type={key === 'email' ? 'email' : 'text'} value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} /></label>)}<div><p className="text-sm">Role: {user.role}</p><p className="mt-2">Staff number: {user.staffNo}</p><p className="mt-2">Branches: {user.branchIds.join(', ')}</p></div><ImageUpload label="Avatar" onChange={blob => { if (blob) void action.run(async () => { const avatarId = await imageService.save(blob); setDraft(d => ({ ...d, avatarId })); }); else setDraft(d => ({ ...d, avatarId: undefined })); }} /><div className="sm:col-span-2"><button className="btn-primary" disabled={action.busy}>Save account</button></div></form></FeaturePage>;
}
