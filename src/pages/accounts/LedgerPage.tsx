import { T } from "../../i18n/T";
import {CategoryManager} from '../../components/accounts/CategoryManager';
import {ReceiptAttachment} from '../../components/accounts/ReceiptAttachment';
import {useState} from 'react';
import {Download,Eye,Pencil,Plus,Trash2} from 'lucide-react';
import {accountService} from '../../services/accountService';
import {ledgerService} from '../../services/ledgerService';
import {manualEntryService} from '../../services/manualEntryService';
import {orderService} from '../../services/orderService';
import {purchaseService} from '../../services/purchaseService';
import {useLocalData} from '../../services/useLocalData';
import {usePermission} from '../../hooks/usePermission';
import {payrollMoney} from '../../utils/money';
import {exportCSV} from '../../utils/csv';
import {fromCentavos,toCentavos} from '../../utils/pos';
import {defaultReportFilter,localDay,inRange} from '../../utils/reports/period';
import {formatDate} from '../../utils/date';
import {AccountsShell} from '../../components/accounts/AccountsShell';
import {ManualEntryEditor} from '../../components/accounts/ManualEntryEditor';
import {LedgerSource} from '../../components/accounts/LedgerSource';
import {DateRangePicker} from '../../components/reports/DateRangePicker';
import {BranchFilter} from '../../components/reports/BranchFilter';
import {CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {CustomerIdentity} from '../../components/customers/CustomerIdentity';
import {DataTable} from '../../components/common/DataTable';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
import {StatusBadge} from '../../components/common/StatusBadge';
import {Drawer} from '../../components/common/Drawer';
import {Avatar} from '../../components/common/Avatar';
import type {LedgerEntry,LedgerFilter,ManualEntry} from '../../types/accounts';

export function LedgerPage({type}:{type:'income'|'expense'}){
 useLocalData();const {can}=usePermission(),manage=can('accounts:manage'),title=type==='income'?'Income':'Expenses';
 const initial:LedgerFilter={...defaultReportFilter(),branchId:accountService.activeBranch(),type};
 const [filter,setFilter]=useState(initial),[method,setMethod]=useState(''),[edit,setEdit]=useState<ManualEntry|null|undefined>(undefined),[remove,setRemove]=useState(''),[selected,setSelected]=useState<string[]>([]),[view,setView]=useState<LedgerEntry|null>(null);
 const accounts=accountService.list(),paymentMethod=(e:LedgerEntry)=>e.method??accounts.find(a=>a.id===e.accountId)?.type??'—';
 const entries=ledgerService.getEntries(filter).reverse().filter(e=>!method||paymentMethod(e)===method),total=entries.reduce((n,e)=>n+e.amount,0),today=entries.filter(e=>localDay(e.date)===localDay()).reduce((n,e)=>n+e.amount,0);
 const pending=type==='income'?orderService.list({branchId:filter.branchId??'all'}).filter(o=>inRange(o.createdAt,filter)&&o.orderStatus!=='cancelled').reduce((n,o)=>n+toCentavos(o.balanceDue),0):purchaseService.list().filter(p=>(filter.branchId==='all'||(p.receivingBranchId??p.branchId??'Main Branch')===filter.branchId)&&inRange(p.date,filter)&&p.receiveStatus!=='cancelled').reduce((n,p)=>n+toCentavos(p.balanceDue),0);
 return <AccountsShell title={title}><div className="panel ledger-summary">{[
  {label:`Total ${title}`,value:payrollMoney(total),note:'Recorded cash movements in range'},
  {label:`Today’s ${title}`,value:payrollMoney(today),note:'Recorded today'},
  {label:type==='income'?'Pending Income':'Pending Supplier Payments',value:payrollMoney(pending),note:type==='income'?'Outstanding order balances':'Unsettled supplier purchases'},
  {label:type==='income'?'Total Records':'Total Vouchers',value:entries.length,note:'Records in selected period'},
  {label:type==='income'?'Avg / Record':'Avg / Expense',value:payrollMoney(entries.length?Math.round(total/entries.length):0),note:'Average recorded amount'}
 ].map(m=><article key={m.label}><h2>{m.label}</h2><strong>{m.value}</strong><p>{m.note}</p></article>)}</div><section className="panel"><CommercePanelHeading title={title}><button className="btn" onClick={()=>exportCSV(`${type}.csv`,[['Date','Reference','Payee','Category','Method','Status','Amount PHP','Type','Recorded By'],...entries.map(e=>[e.date,e.reference??'',e.payee??orderService.get(e.sourceId??'')?.customerName??'',e.category,paymentMethod(e),'paid',fromCentavos(e.amount),e.isLiability?'Wallet liability':e.sourceType,e.createdBy??'System'])])}><Download size={15}/><T text={"Export CSV"}/></button>{manage&&<><CategoryManager type={type}/><button className="btn-primary" onClick={()=>setEdit(null)}><Plus size={16}/><T text={"Add "}/>{type==='income'?'Income':'Expense'}</button></>}</CommercePanelHeading>
 <div className="commerce-filters"><DateRangePicker value={{from:filter.from??'',to:filter.to??''}} onChange={r=>setFilter({...filter,...r})}/><select aria-label="Category" value={filter.category??''} onChange={e=>setFilter({...filter,category:e.target.value})}><option value=""><T text={"Category"}/></option>{ledgerService.categoryNames(type).map(c=><option key={c}>{c}</option>)}</select><select aria-label="Payment method" value={method} onChange={e=>setMethod(e.target.value)}><option value=""><T text={"Method"}/></option>{[...new Set(ledgerService.getEntries({type}).map(paymentMethod))].map(m=><option key={m}>{m}</option>)}</select><select aria-label="Entry source" value={filter.source??''} onChange={e=>setFilter({...filter,source:e.target.value as LedgerFilter['source']})}><option value=""><T text={"Type"}/></option><option value="auto"><T text={"Automatic"}/></option><option value="manual"><T text={"Manual"}/></option></select><BranchFilter value={filter.branchId??'all'} onChange={branchId=>setFilter({...filter,branchId})}/><button className="btn" onClick={()=>{setFilter(initial);setMethod('');}}><T text={"Reset"}/></button></div>
 <DataTable caption={title} rows={entries} rowKey={e=>e.id} searchText={e=>`${e.category} ${e.reference??''} ${e.note??''} ${e.payee??''} ${orderService.get(e.sourceId??'')?.customerName??''}`} selection={selected} onSelectionChange={setSelected} columns={type==='income'?[
  {id:'date',header:'Date',cell:e=>formatDate(e.date),sortValue:e=>e.date},
  {id:'invoice',header:'Invoice / Reference',cell:e=><LedgerSource entry={e}/>},
  {id:'customer',header:'Customer / Received From',cell:e=>{const o=e.sourceType==='order'||e.sourceType==='collection'?orderService.get(e.sourceId??''):undefined;return o?<CustomerIdentity id={o.customerId} name={o.customerName} email={false}/>:e.payee||'—';}},
  {id:'category',header:'Category',cell:e=>e.category},
  {id:'method',header:'Payment Method',cell:e=><span className="btn !min-h-7 !text-xs capitalize">{paymentMethod(e)}</span>},
  {id:'status',header:'Status',cell:()=><StatusBadge>paid</StatusBadge>},
  {id:'amount',header:'Amount',cell:e=>payrollMoney(e.amount),sortValue:e=>e.amount},
  {id:'type',header:'Income Type',cell:e=>e.isLiability?'Wallet liability':e.sourceType==='manual'?'Other income':'Sale'}
 ]:[
  {id:'voucher',header:'Voucher / Reference',cell:e=><LedgerSource entry={e}/>},
  {id:'payee',header:'Payee',cell:e=>e.payee||e.note||e.category},
  {id:'category',header:'Category',cell:e=>e.category},
  {id:'method',header:'Payment Method',cell:e=><span className="btn !min-h-7 !text-xs capitalize">{paymentMethod(e)}</span>},
  {id:'by',header:'Recorded By',cell:e=><span className="account-holder"><Avatar name={e.createdBy??'System'}/>{e.createdBy??'System'}</span>},
  {id:'date',header:'Date',cell:e=>formatDate(e.date),sortValue:e=>e.date},
  {id:'status',header:'Status',cell:()=><StatusBadge>paid</StatusBadge>},
  {id:'amount',header:'Amount',cell:e=>payrollMoney(e.amount),sortValue:e=>e.amount}
 ]} actions={e=><div className="commerce-actions"><button onClick={()=>setView(e)} aria-label={`View ${e.reference??e.category}`}><Eye size={15}/></button>{manage&&!e.isAuto&&<><button className="edit" onClick={()=>setEdit(manualEntryService.get(e.id))} aria-label={`Edit ${e.category}`}><Pencil size={15}/></button><button className="danger" onClick={()=>setRemove(e.id)} aria-label={`Delete ${e.category}`}><Trash2 size={15}/></button></>}</div>}/>
 </section>{type==='income'&&<p className="mt-3 text-xs commerce-muted">Wallet top-ups are liabilities and are excluded from report income and profit.</p>}{edit!==undefined&&<ManualEntryEditor type={type} entry={edit??undefined} onClose={()=>setEdit(undefined)}/>}<ConfirmDialog open={!!remove} title={`Delete ${type}?`} message="This removes the manual entry and recalculates the account balance." onClose={()=>setRemove('')} onConfirm={()=>manualEntryService.remove(remove)}/><Drawer open={!!view} title="Record details" onClose={()=>setView(null)}>{view&&<div className="space-y-4"><LedgerSource entry={view}/><p>{formatDate(view.date)}</p><p>{view.category}</p><strong className="text-xl">{payrollMoney(view.amount)}</strong><p>Account: {accounts.find(a=>a.id===view.accountId)?.name}</p><p>Recorded by: {view.createdBy??'System'}</p><p>{view.note}</p>{view.attachmentId&&<ReceiptAttachment id={view.attachmentId}/>}</div>}</Drawer></AccountsShell>;
}
