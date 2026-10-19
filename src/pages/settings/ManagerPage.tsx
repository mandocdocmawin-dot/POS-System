import { T } from "../../i18n/T";
import { SettingsPage, SettingsCard } from '../../components/settings/SettingsPage';
import { SettingText, SettingNumber, SettingToggle } from '../../components/settings/SettingFields';
import { Link } from 'react-router-dom';
import { approvalService } from '../../services/approvalService';
export function Component(){return <SettingsPage section="manager" title="Manager approvals">{(s,change)=><>
 <SettingsCard title="Approval rules">{(['cashierDiscountLimitPercent','refundApprovalAbove','stockAdjustmentApprovalAboveUnits'] as const).map(k=><SettingNumber key={k} label={k==='refundApprovalAbove'?'Refund approval above (centavos)':k.replace(/([A-Z])/g,' $1')} value={s.approvals[k]} onChange={v=>change({...s,approvals:{...s.approvals,[k]:v}})}/>)}{(['cancelOrderNeedsApproval','voidHeldNeedsApproval'] as const).map(k=><SettingToggle key={k} label={k.replace(/([A-Z])/g,' $1')} value={s.approvals[k]} onChange={v=>change({...s,approvals:{...s.approvals,[k]:v}})}/>)}</SettingsCard>
 <SettingsCard title="Demo PIN"><SettingToggle label="Require 4-digit approver PIN" value={s.requirePin} onChange={v=>change({...s,requirePin:v})}/><SettingText label="Demo PIN hint" value={s.demoPinHint} onChange={v=>change({...s,demoPinHint:v})}/><p>PINs are plain local demo data. Login remains validation-free.</p></SettingsCard>
 <SettingsCard title="Who can approve">{approvalService.approvers().map(p=><p key={p.id}>{p.name} · {p.role}</p>)}<Link to="/staff/role-permission" className="text-orange-600 underline"><T text={"Role Permission"}/></Link></SettingsCard>
 </>}</SettingsPage>;}
