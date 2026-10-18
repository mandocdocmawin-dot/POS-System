import { useState } from 'react';
import { SettingsPage, SettingsCard } from '../../components/settings/SettingsPage';
import { SettingText, SettingNumber, SettingSelect, SettingToggle } from '../../components/settings/SettingFields';
import { ReceiptView } from '../../components/pos/ReceiptView';
import { createPosSeed } from '../../data/seed/pos';
import { useSettings } from '../../hooks/useSettings';
export function Component(){const [sample]=useState(()=>createPosSeed().orders[0]);const business=useSettings(s=>s.general);return <SettingsPage section="invoice" title="Invoices">{(s,change)=><>
 <p className="rounded-lg border border-amber-300 p-4">DEMO ONLY. Receipts are not BIR-accredited or statutory-compliant.</p>
 <SettingsCard title="Numbering">{(['prefix','purchasePrefix','refundPrefix','purchaseReturnPrefix','transferPrefix','accountTransferPrefix'] as const).map(k=><SettingText key={k} label={k.replace(/([A-Z])/g,' $1')} value={s[k]} onChange={v=>change({...s,[k]:v})}/>)}<SettingNumber label="Padding" value={s.padding} min={1} max={12} step="1" onChange={v=>change({...s,padding:v})}/><SettingNumber label="Next invoice number (raise only)" value={s.nextNumber} min={1} step="1" onChange={v=>change({...s,nextNumber:v})}/><SettingToggle label="Include branch code" value={s.includeBranchCode} onChange={v=>change({...s,includeBranchCode:v})}/></SettingsCard>
 <SettingsCard title="Receipt content">{(['receiptHeader','receiptFooter','terms'] as const).map(k=><SettingText key={k} label={k.replace(/([A-Z])/g,' $1')} value={s[k]} onChange={v=>change({...s,[k]:v})}/>)}<SettingSelect label="Paper size" value={s.paperSize} options={['58mm','80mm','a4']} onChange={v=>change({...s,paperSize:v})}/>{(['showLogo','showCashier','showCustomer','showBarcode','showPointsEarned'] as const).map(k=><SettingToggle key={k} label={k.replace(/([A-Z])/g,' $1')} value={s[k]} onChange={v=>change({...s,[k]:v})}/>)}</SettingsCard>
 <section className="card overflow-auto"><h2 className="mb-4 text-lg font-semibold">Live receipt preview</h2><ReceiptView receipt={sample} config={s} business={business}/></section>
 </>}</SettingsPage>;}
