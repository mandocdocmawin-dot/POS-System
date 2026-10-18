import {IntegrityCard} from '../../components/settings/IntegrityCard';
import {Can} from '../../components/auth/Can';
import {StorageCard} from '../../components/settings/StorageCard';
import {DataDemoCard} from '../../components/settings/DataDemoCard';
import { useState } from 'react';
import { SettingsPage, SettingsCard } from '../../components/settings/SettingsPage';
import { SettingText, SettingNumber, SettingSelect, SettingToggle } from '../../components/settings/SettingFields';
import { ImageUpload } from '../../components/forms/ImageUpload';
import { imageService } from '../../services/imageService';
import { settingsService } from '../../services/settingsService';
import { useSettings } from '../../hooks/useSettings';
import { usePermission } from '../../hooks/usePermission';
import { formatDate, formatTime, formatMoney } from '../../utils/formatters';
import type {Settings} from '../../types/settings';
function StaffDefaults({draft,setDraft}:{draft:Settings['staffDefaults'];setDraft:(value:Settings['staffDefaults'])=>void}) {
 const {can}=usePermission();
 return <fieldset disabled={!can('settings:manage')}><SettingsCard title="Attendance and payroll defaults"><p className="md:col-span-2 text-sm text-slate-500">Applies to new payroll runs only; finalized runs unchanged.</p>
 <SettingText label="Default shift start" type="time" value={draft.defaultShiftStart} onChange={v=>setDraft({...draft,defaultShiftStart:v})}/>
 {(['lateGraceMinutes','overtimeMultiplier','regularHolidayMultiplier','specialHolidayMultiplier','workHoursPerDay'] as const).map(k=><SettingNumber key={k} label={k.replace(/([A-Z])/g,' $1')} value={draft[k]} onChange={v=>setDraft({...draft,[k]:v})}/>)}
 </SettingsCard></fieldset>;
}
export function Component() {
 const savedStaff=useSettings(s=>s.staffDefaults),[staff,setStaff]=useState(()=>structuredClone(savedStaff));
 return <SettingsPage section="general" title="General" related={{dirty:JSON.stringify(staff)!==JSON.stringify(savedStaff),diff:settingsService.preview('staffDefaults',staff),save:()=>{settingsService.save('staffDefaults',staff);},discard:()=>setStaff(structuredClone(savedStaff)),reset:()=>setStaff(settingsService.defaults('staffDefaults'))}} extra={<><StaffDefaults draft={staff} setDraft={setStaff}/><DataDemoCard/><Can permission="settings:manage"><StorageCard/><IntegrityCard/></Can></>}>{(s,change)=><>
 <SettingsCard title="Maintenance mode"><SettingToggle label="Maintenance mode" value={s.maintenanceMode} onChange={v=>change({...s,maintenanceMode:v})}/><SettingText label="Maintenance message" value={s.maintenanceMessage} onChange={v=>change({...s,maintenanceMessage:v})}/><SettingText label="Expected return (optional)" type="datetime-local" value={s.maintenanceReturnAt??''} onChange={v=>change({...s,maintenanceReturnAt:v||undefined})}/><p>Other users are redirected to maintenance. Open POS carts are preserved.</p></SettingsCard><SettingsCard title="Business information">{(['businessName','legalName','tin','phone','email','address'] as const).map(k=><SettingText key={k} label={k.replace(/([A-Z])/g,' $1')} value={s[k]??''} onChange={v=>change({...s,[k]:v})}/>)}
 <ImageUpload label="Business logo" onChange={blob=>{if(blob)void imageService.save(blob).then(logoId=>change({...s,logoId}));else change({...s,logoId:undefined});}}/></SettingsCard>
 <SettingsCard title="Formats and defaults"><SettingSelect label="Date format" value={s.dateFormat} options={['MMM d, yyyy','dd/MM/yyyy','yyyy-MM-dd']} onChange={v=>change({...s,dateFormat:v})}/><SettingSelect label="Time format" value={s.timeFormat} options={['12h','24h']} onChange={v=>change({...s,timeFormat:v})}/><SettingSelect label="Week starts on" value={s.weekStartsOn} options={['monday','sunday']} onChange={v=>change({...s,weekStartsOn:v})}/><SettingSelect label="Default theme" value={s.defaultTheme} options={['light','dark','system']} onChange={v=>change({...s,defaultTheme:v})}/><SettingNumber label="Default reorder level" value={s.lowStockDefaultReorder} onChange={v=>change({...s,lowStockDefaultReorder:v})}/><p aria-live="polite">Preview: {formatDate(new Date(),s.dateFormat)} · {formatTime(new Date(),s.timeFormat)} · {formatMoney(123456)}</p></SettingsCard>
 </>}</SettingsPage>;
}
