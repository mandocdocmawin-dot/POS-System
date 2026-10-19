import { T } from "../../i18n/T";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {FeaturePage} from '../../components/common/FeaturePage';
import {useAction} from '../../hooks/useAction';
import {accountTabs} from '../../config/accountTabs';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { planService, demoPaymentMethods } from '../../services/planService';
import { useLocalData } from '../../services/useLocalData';
import { formatMoney } from '../../utils/money';
import type { BillingInvoice } from '../../types/phase8';
export function Component() {
  useLocalData(); const billing = planService.billing(), plans = planService.list(), action = useAction(), [invoice, setInvoice] = useState<BillingInvoice>();
  return <FeaturePage title="Billing & plans" tabs={[...accountTabs, ['Billing & plans', '/account/billing-plans']]} description="Demo billing only. No payments are collected and no plan limits are enforced.">{action.feedback}<section className="card space-y-4"><h2 className="text-xl font-semibold">{plans.find(p => p.id === billing.subscription?.planId)?.name ?? 'No plan selected'}</h2><p><T text={"Next billing date: "}/>{billing.subscription?.nextBillingDate ?? '—'}</p><p><T text={"Billing cycle: "}/>{billing.subscription?.billingCycle ?? '—'}</p><label className="grid max-w-sm gap-2"><T text={"Demo payment method"}/><select value={billing.subscription?.paymentMethodLabel ?? ''} onChange={e => { void action.run(() => planService.paymentMethod(e.target.value), 'Demo payment method saved'); }}>{demoPaymentMethods.map(method => <option key={method}>{method}</option>)}</select></label><Link className="btn" to="/pricing/user"><T text={"Change plan"}/></Link></section><DataTable caption="Demo invoice history" rows={billing.invoices} rowKey={i => i.id} columns={[{ id: 'number', header: 'Invoice', cell: i => i.invoiceNo }, { id: 'date', header: 'Issued', cell: i => new Date(i.issuedAt).toLocaleDateString() }, { id: 'amount', header: 'Amount', cell: i => formatMoney(i.amount) }, { id: 'status', header: 'Status', cell: i => i.status }]} actions={i => <button className="btn" onClick={() => setInvoice(i)}><T text={"View / print"}/></button>} /><Modal open={!!invoice} title="Demo billing invoice" onClose={() => setInvoice(undefined)}>{invoice && <section className="report-document space-y-5"><h2 className="text-xl font-bold">TindaPOS · DEMO INVOICE</h2><p>{invoice.invoiceNo}</p><p>{plans.find(p => p.id === invoice.planId)?.name ?? invoice.planId}</p><p>{new Date(invoice.issuedAt).toLocaleString()}</p><p className="text-2xl font-bold">{formatMoney(invoice.amount)}</p><p>Marked {invoice.status} for demonstration. No actual payment.</p><button className="btn" onClick={() => window.print()}><T text={"Print demo invoice"}/></button></section>}</Modal></FeaturePage>;
}
