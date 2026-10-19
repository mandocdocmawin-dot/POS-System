import { T } from "../../i18n/T";
import {useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Download,Eye,Plus,CreditCard,History} from 'lucide-react';
import {CommerceWorkspace,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {SupplierIdentity} from '../../components/suppliers/SupplierIdentity';
import {SupplierPaymentForm} from '../../components/suppliers/SupplierPaymentForm';
import {SupplierPaymentsTable} from '../../components/suppliers/SupplierPaymentsTable';
import {Can} from '../../components/auth/Can';
import {DataTable} from '../../components/common/DataTable';
import {Modal} from '../../components/common/Modal';
import {Drawer} from '../../components/common/Drawer';
import {StatusBadge} from '../../components/common/StatusBadge';
import {DateRangeFilter,type DateRange} from '../../components/common/DateRangeFilter';
import {supplierService} from '../../services/supplierService';
import {supplierPaymentService} from '../../services/supplierPaymentService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
import {formatDate} from '../../utils/date';
import {inDateRange} from '../../utils/dateRange';
import {exportCSV} from '../../utils/csv';

export function Component(){
 useLocalData();const [params,setParams]=useSearchParams();
 const [open,setOpen]=useState(!!params.get('supplier')||!!params.get('purchase')),[paySupplier,setPaySupplier]=useState(params.get('supplier')??''),[payPurchase,setPayPurchase]=useState(params.get('purchase')??''),[history,setHistory]=useState(''),[status,setStatus]=useState(''),[method,setMethod]=useState(''),[selected,setSelected]=useState<string[]>([]),[range,setRange]=useState<DateRange>({from:'',to:''});
 const rows=supplierService.list().map(s=>{const report=supplierService.report(s.id),payments=supplierPaymentService.list(s.id);return {...s,...report,payments,last:payments[0],paymentStatus:report.total>0&&report.balance<=0?'paid':report.paid>0?'partial':'unpaid'};}).filter(s=>(!status||s.paymentStatus===status)&&(!method||s.last?.method===method)&&(!range.from&&!range.to||!!s.last&&inDateRange(s.last.createdAt,range)));
 const close=()=>{setOpen(false);setParams(p=>{p.delete('supplier');p.delete('purchase');return p;},{replace:true});};
 const add=(id='')=>{setPaySupplier(id);setPayPurchase('');setOpen(true);};
 return <CommerceWorkspace title="Payments" section="Suppliers"><div className="panel">
  <CommercePanelHeading title="All Payments"><button className="btn" onClick={()=>exportCSV('supplier-payments-summary.csv',[['Supplier','Total Purchase','Total Paid','Returns / Credits','Pending Amount','Status','Last Date','Method'],...rows.map(s=>[s.name,s.total,s.paid,s.returns,Math.max(0,s.balance),s.paymentStatus,s.last?.createdAt??'',s.last?.method??''])])}><Download size={15}/><T text={"Export As CSV"}/></button><Can permission="purchases:create"><button className="btn-primary" onClick={()=>add()}><Plus size={16}/><T text={"Add Payments"}/></button></Can></CommercePanelHeading>
  <div className="commerce-filters"><DateRangeFilter value={range} onChange={setRange}/><select aria-label="Supplier payment status" value={status} onChange={e=>setStatus(e.target.value)}><option value=""><T text={"Select Status"}/></option><option value="paid"><T text={"Paid"}/></option><option value="partial"><T text={"Partial"}/></option><option value="unpaid"><T text={"Unpaid"}/></option></select><select aria-label="Supplier payment method" value={method} onChange={e=>setMethod(e.target.value)}><option value=""><T text={"Select Method"}/></option>{['cash','gcash','maya','card','bank'].map(m=><option key={m}>{m}</option>)}</select></div>
  <DataTable caption="Supplier payments" rows={rows} rowKey={s=>s.id} searchText={s=>`${s.name} ${s.phone??''} ${s.email??''}`} selection={selected} onSelectionChange={setSelected} columns={[
   {id:'supplier',header:'Supplier',cell:s=><SupplierIdentity id={s.id}/>,sortValue:s=>s.name},
   {id:'total',header:'Total Purchase',cell:s=>formatPHP(s.total),sortValue:s=>s.total},
   {id:'paid',header:'Total Paid',cell:s=>formatPHP(s.paid),sortValue:s=>s.paid},
   {id:'due',header:'Pending Amount',cell:s=><>{formatPHP(Math.max(0,s.balance))}{s.credit>0&&<small className="commerce-subline">Credit: {formatPHP(s.credit)}</small>}</>,sortValue:s=>s.balance},
   {id:'status',header:'Status',cell:s=><StatusBadge>{s.paymentStatus}</StatusBadge>},
   {id:'date',header:'Last Date',cell:s=>s.last?formatDate(new Date(s.last.createdAt)):'—',sortValue:s=>s.last?.createdAt??''},
   {id:'method',header:'Method',cell:s=>s.last?.method??'—'}
  ]} actions={s=><div className="commerce-actions"><Link to={`/suppliers/${s.id}`} aria-label={`View ${s.name}`}><Eye size={15}/></Link><button className="edit" onClick={()=>setHistory(s.id)} aria-label={`Payment history for ${s.name}`}><History size={15}/></button><Can permission="purchases:create"><button disabled={s.balance<=0} onClick={()=>add(s.id)} aria-label={`Add payment to ${s.name}`}><CreditCard size={15}/></button></Can></div>}/>
 </div><Modal open={open} title="Record supplier payment" onClose={close}><SupplierPaymentForm key={`${paySupplier}-${payPurchase}-${open}`} supplierId={paySupplier} purchaseId={payPurchase} onSave={close}/></Modal><Drawer open={!!history} title={`${supplierService.get(history)?.name??'Supplier'} · Payment history`} onClose={()=>setHistory('')}><SupplierPaymentsTable initialSupplier={history}/></Drawer></CommerceWorkspace>;
}
