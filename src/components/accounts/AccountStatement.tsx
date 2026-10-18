import { useState } from 'react';
import type { BankAccount } from '../../types/accounts';
import { ledgerService } from '../../services/ledgerService';
import { Drawer } from '../common/Drawer';
import { DateRangePicker } from '../reports/DateRangePicker';
import { PrintHeader } from '../reports/ReportHeader';
import { ReportTable } from '../reports/ReportSection';
import { LedgerSource } from './LedgerSource';
import { defaultReportFilter } from '../../utils/reports/period';
import { payrollMoney } from '../../utils/money';
import { exportCSV } from '../../utils/csv';
import { fromCentavos } from '../../utils/pos';
export function AccountStatement({account,onClose}:{account:BankAccount;onClose:()=>void}){const [range,setRange]=useState(defaultReportFilter());const s=ledgerService.statement(account.id,range);return <Drawer open title={`${account.name} statement`} onClose={onClose}><div className="report-document space-y-5"><PrintHeader title={`${account.name} statement`} filter={range}/><div className="report-controls space-y-3"><DateRangePicker value={range} onChange={r=>setRange({...range,...r})}/><div className="flex gap-2"><button className="btn" onClick={()=>exportCSV(`${account.name}-statement.csv`,[['Date','Category','Reference','Type','Amount PHP','Balance PHP'],[range.from,'Opening','','','',fromCentavos(s.opening)],...s.rows.map(e=>[e.date,e.category,e.reference??'',e.type,fromCentavos(e.amount),fromCentavos(e.runningBalance)]),[range.to,'Closing','','','',fromCentavos(s.closing)]])}>Export CSV</button><button className="btn" onClick={()=>window.print()}>Print</button></div></div><p className="text-sm">Opening {payrollMoney(s.opening)} · Closing <strong>{payrollMoney(s.closing)}</strong></p><ReportTable title="Account statement" rows={s.rows} rowKey={e=>e.id} columns={[{id:'date',header:'Date',cell:e=>new Date(e.date.length===10?`${e.date}T12:00:00`:e.date).toLocaleDateString()},{id:'category',header:'Category',cell:e=>e.category},{id:'source',header:'Source',cell:e=><LedgerSource entry={e}/>},{id:'type',header:'Type',cell:e=>e.type},{id:'amount',header:'Amount',cell:e=>payrollMoney(e.amount)},{id:'balance',header:'Running balance',cell:e=>payrollMoney(e.runningBalance)}]}/></div></Drawer>;}
