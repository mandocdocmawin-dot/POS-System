import { useState } from 'react';
import { SettingsPage, SettingsCard } from '../../components/settings/SettingsPage';
import { SettingText, SettingNumber, SettingSelect } from '../../components/settings/SettingFields';
import { ImageUpload } from '../../components/forms/ImageUpload';
import { imageService } from '../../services/imageService';
import { settingsService } from '../../services/settingsService';
import { useSettings } from '../../hooks/useSettings';
import { usePermission } from '../../hooks/usePermission';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate, formatTime, formatMoney } from '../../utils/formatters';
function StaffDefaults() {
 const saved=useSettings(s=>s.staffDefaults), [draft,setDraft]=useState(()=>structuredClone(saved)), [confirm,setConfirm]=useState(false);const {can}=usePermission();
 return <fieldset disabled={!can('settings:manage')}><SettingsCard title="Attendance and payroll defaults"><p className="md:col-span-2 text-sm text-slate-500">Applies to new payroll runs only; finalized runs unchanged.</p>
 <SettingText label="Default shift start" type="time" value={draft.defaultShiftStart} onChange={v=>setDraft({...draft,defaultShiftStart:v})}/>
 {(['lateGraceMinutes','overtimeMultiplier','regularHolidayMultiplier','specialHolidayMultiplier','workHoursPerDay'] as const).map(k=><SettingNumber key={k} label={k.replace(/([A-Z])/g,' $1')} value={draft[k]} onChange={v=>setDraft({...draft,[k]:v})}/>)}
 <button className="btn" disabled={JSON.stringify(saved)===JSON.stringify(draft)} onClick={()=>setConfirm(true)}>Save staff defaults</button>
 </SettingsCard><ConfirmDialog open={confirm} title="Save staff defaults?" message={settingsService.preview('staffDefaults',draft).join('\n')} onClose={()=>setConfirm(false)} onConfirm={()=>{settingsService.save('staffDefaults',draft);}}/></fieldset>;
}
export function Component() {
 return <SettingsPage section="general" title="General" extra={<StaffDefaults/>}>{(s,change)=><>
 <SettingsCard title="Business information">{(['businessName','legalName','tin','phone','email','address'] as const).map(k=><SettingText key={k} label={k.replace(/([A-Z])/g,' $1')} value={s[k]??''} onChange={v=>change({...s,[k]:v})}/>)}
 <ImageUpload label="Business logo" onChange={blob=>{if(blob)void imageService.save(blob).then(logoId=>change({...s,logoId}));else change({...s,logoId:undefined});}}/></SettingsCard>
 <SettingsCard title="Formats and defaults"><SettingSelect label="Date format" value={s.dateFormat} options={['MMM d, yyyy','dd/MM/yyyy','yyyy-MM-dd']} onChange={v=>change({...s,dateFormat:v})}/><SettingSelect label="Time format" value={s.timeFormat} options={['12h','24h']} onChange={v=>change({...s,timeFormat:v})}/><SettingSelect label="Week starts on" value={s.weekStartsOn} options={['monday','sunday']} onChange={v=>change({...s,weekStartsOn:v})}/><SettingSelect label="Default theme" value={s.defaultTheme} options={['light','dark','system']} onChange={v=>change({...s,defaultTheme:v})}/><SettingNumber label="Default reorder level" value={s.lowStockDefaultReorder} onChange={v=>change({...s,lowStockDefaultReorder:v})}/><p aria-live="polite">Preview: {formatDate(new Date(),s.dateFormat)} · {formatTime(new Date(),s.timeFormat)} · {formatMoney(123456)}</p></SettingsCard>
 </>}</SettingsPage>;
}
