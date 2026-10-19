import { T } from "../../i18n/T";
import {useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Plus,Download,Eye,CreditCard,History} from 'lucide-react';
import {CommerceWorkspace,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {SupplierIdentity} from '../../components/suppliers/SupplierIdentity';
import {SupplierPaymentForm} from '../../components/suppliers/SupplierPaymentForm';
import {Can} from '../../components/auth/Can';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {Modal} from '../../components/common/Modal';
import {Drawer} from '../../components/common/Drawer';
import {Timeline} from '../../components/common/Timeline';
import {DateRangeFilter,type DateRange} from '../../components/common/DateRangeFilter';
import {purchaseService} from '../../services/purchaseService';
import {supplierService} from '../../services/supplierService';
import {supplierPaymentService} from '../../services/supplierPaymentService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
import {formatDate} from '../../utils/date';
import {inDateRange} from '../../utils/dateRange';
import {exportCSV} from '../../utils/csv';

export function Component(){
 useLocalData();const [params,setParams]=useSearchParams();
 const [open,setOpen]=useState(!!params.get('purchase')),[purchaseId,setPurchaseId]=useState(params.get('purchase')??''),[status,setStatus]=useState(''),[method,setMethod]=useState(''),[range,setRange]=useState<DateRange>({from:'',to:''}),[selected,setSelected]=useState<string[]>([]),[history,setHistory]=useState('');
 const payments=supplierPaymentService.list(),rows=purchaseService.list().filter(p=>p.receiveStatus!=='cancelled').map(p=>({...p,last:payments.find(t=>t.purchaseId===p.id)})).filter(p=>(!status||p.paymentStatus===status)&&(!method||p.last?.method===method)&&(!range.from&&!range.to||!!p.last&&inDateRange(p.last.createdAt,range))),current=purchaseService.get(purchaseId);
 const close=()=>{setOpen(false);setParams(p=>{p.delete('purchase');return p;},{replace:true});};
 return <CommerceWorkspace title="Payments" section="Purchases"><div className="panel"><CommercePanelHeading title="Payments"><button className="btn" onClick={()=>exportCSV('purchase-payments.csv',[['Purchase ID','Supplier','Total','Paid','Due','Method','Status','Last Payment'],...rows.map(p=>[p.purchaseNo,supplierService.get(p.supplierId)?.name??'',p.grandTotal,p.amountPaid,p.balanceDue,p.last?.method??'',p.paymentStatus,p.last?.createdAt??''])])}><Download size={15}/><T text={"Export As CSV"}/></button><Can permission="purchases:create"><button className="btn-primary" onClick={()=>{setPurchaseId('');setOpen(true);}}><Plus size={16}/><T text={"Add Payments"}/></button></Can></CommercePanelHeading>
 <div className="commerce-filters"><select aria-label="Payment status" value={status} onChange={e=>setStatus(e.target.value)}><option value=""><T text={"Select Status"}/></option>{['paid','partial','unpaid'].map(s=><option key={s}>{s}</option>)}</select><select aria-label="Payment method" value={method} onChange={e=>setMethod(e.target.value)}><option value=""><T text={"Select Method"}/></option>{['cash','gcash','maya','card','bank'].map(m=><option key={m}>{m}</option>)}</select><DateRangeFilter value={range} onChange={setRange}/></div>
 <DataTable caption="Purchase payments" rows={rows} rowKey={p=>p.id} selection={selected} onSelectionChange={setSelected} searchText={p=>`${p.purchaseNo} ${supplierService.get(p.supplierId)?.name??''} ${p.last?.reference??''}`} columns={[
  {id:'id',header:'Purchase ID',cell:p=><Link to={`/purchases/${p.id}`}>{p.purchaseNo}</Link>,sortValue:p=>p.purchaseNo},
  {id:'supplier',header:'Supplier',cell:p=><SupplierIdentity id={p.supplierId} email/>},
  {id:'total',header:'Total',cell:p=>formatPHP(p.grandTotal),sortValue:p=>p.grandTotal},
  {id:'paid',header:'Paid',cell:p=>formatPHP(p.amountPaid),sortValue:p=>p.amountPaid},
  {id:'due',header:'Due',cell:p=>formatPHP(p.balanceDue),sortValue:p=>p.balanceDue},
  {id:'method',header:'Payment Method',cell:p=>p.last?<span className="inline-flex items-center gap-2"><CreditCard size={18} className="text-indigo-600"/><span className="capitalize">{p.last.method}{p.last.reference&&<small className="commerce-subline">Ref: {p.last.reference}</small>}</span></span>:'—'},
  {id:'status',header:'Payment Status',cell:p=><StatusBadge>{p.paymentStatus}</StatusBadge>},
  {id:'date',header:'Last Payment',cell:p=>p.last?formatDate(new Date(p.last.createdAt)):'—',sortValue:p=>p.last?.createdAt??''}
 ]} actions={p=><div className="commerce-actions"><Link to={`/purchases/${p.id}`} aria-label={`View ${p.purchaseNo}`}><Eye size={15}/></Link><button className="edit" onClick={()=>setHistory(p.id)} aria-label={`Payment history for ${p.purchaseNo}`}><History size={15}/></button><Can permission="purchases:create"><button disabled={p.balanceDue<=0} onClick={()=>{setPurchaseId(p.id);setOpen(true);}} aria-label={`Add payment for ${p.purchaseNo}`}><CreditCard size={15}/></button></Can></div>}/>
 </div><Modal open={open} title="Record purchase payment" onClose={close}><SupplierPaymentForm key={`${purchaseId}-${open}`} supplierId={current?.supplierId} purchaseId={purchaseId} onSave={close}/></Modal><Drawer open={!!history} title={`${purchaseService.get(history)?.purchaseNo??'Purchase'} · Payment history`} onClose={()=>setHistory('')}><Timeline items={payments.filter(p=>p.purchaseId===history).map(p=>({...p,description:`${p.method}: ${formatPHP(p.amount)} · ${p.reference??''} ${p.note??''}`}))}/></Drawer></CommerceWorkspace>;
}
