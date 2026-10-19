import { T } from "../../i18n/T";
import {useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Plus,Download,Eye} from 'lucide-react';
import {CommerceWorkspace,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {SupplierIdentity} from '../../components/suppliers/SupplierIdentity';
import {Can} from '../../components/auth/Can';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {DateRangeFilter,type DateRange} from '../../components/common/DateRangeFilter';
import {Drawer} from '../../components/common/Drawer';
import {ProductImage} from '../../components/common/ProductImage';
import {PurchaseReturnFlow} from '../../components/purchases/PurchaseReturnFlow';
import {purchaseService} from '../../services/purchaseService';
import {supplierService} from '../../services/supplierService';
import {branchService} from '../../services/branchService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
import {formatDate} from '../../utils/date';
import {inDateRange} from '../../utils/dateRange';
import {exportCSV} from '../../utils/csv';

export function Component(){
 useLocalData();const [params,setParams]=useSearchParams(),[open,setOpen]=useState(!!params.get('purchase')),[supplier,setSupplier]=useState(''),[branch,setBranch]=useState(''),[range,setRange]=useState<DateRange>({from:'',to:''}),[selected,setSelected]=useState<string[]>([]),[view,setView]=useState('');
 const receivingBranch=(purchaseId:string)=>{const p=purchaseService.get(purchaseId);return p?.receivingBranchId??p?.branchId??'';};
 const rows=purchaseService.returns().filter(r=>(!supplier||r.supplierId===supplier)&&(!branch||receivingBranch(r.purchaseId)===branch)&&inDateRange(r.createdAt,range)).toSorted((a,b)=>b.createdAt.localeCompare(a.createdAt)),record=rows.find(r=>r.id===view),purchase=record?purchaseService.get(record.purchaseId):undefined;
 return <CommerceWorkspace title="Returns" section="Purchases"><div className="panel"><CommercePanelHeading title="Returns List"><button className="btn" onClick={()=>exportCSV('purchase-returns.csv',[['Return ID','Purchase ID','Supplier','Return Items','Return Amount','Status','Date','Receiving Branch','Reason'],...rows.map(r=>[r.returnNo,purchaseService.get(r.purchaseId)?.purchaseNo??'',supplierService.get(r.supplierId)?.name??'',r.items.reduce((n,l)=>n+l.quantity,0),r.creditAmount,'completed',r.createdAt,branchService.get(receivingBranch(r.purchaseId))?.name??receivingBranch(r.purchaseId),r.reason])])}><Download size={15}/><T text={"Export As CSV"}/></button><Can permission="purchases:create"><button className="btn-primary" onClick={()=>setOpen(true)}><Plus size={16}/><T text={"Add Return"}/></button></Can></CommercePanelHeading>
 <div className="commerce-filters"><DateRangeFilter value={range} onChange={setRange}/><select aria-label="Supplier filter" value={supplier} onChange={e=>setSupplier(e.target.value)}><option value=""><T text={"Select Supplier"}/></option>{supplierService.list().map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select aria-label="Receiving branch" value={branch} onChange={e=>setBranch(e.target.value)}><option value=""><T text={"All receiving branches"}/></option>{branchService.list().map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select><span className="commerce-muted text-xs">Confirmed returns update stock and supplier credit.</span></div>
 <DataTable caption="Returns" rows={rows} rowKey={r=>r.id} selection={selected} onSelectionChange={setSelected} searchText={r=>`${r.returnNo} ${purchaseService.get(r.purchaseId)?.purchaseNo??''} ${supplierService.get(r.supplierId)?.name??''} ${r.reason}`} columns={[
  {id:'return',header:'Return ID',cell:r=><button className="text-indigo-600" onClick={()=>setView(r.id)}>{r.returnNo}</button>,sortValue:r=>r.returnNo},
  {id:'purchase',header:'Purchase ID',cell:r=><Link to={`/purchases/${r.purchaseId}`}>{purchaseService.get(r.purchaseId)?.purchaseNo??'—'}</Link>},
  {id:'supplier',header:'Supplier',cell:r=><SupplierIdentity id={r.supplierId}/>},
  {id:'items',header:'Return Items',cell:r=>`${r.items.reduce((n,l)=>n+l.quantity,0)} Items`},
  {id:'amount',header:'Return Amount',cell:r=>formatPHP(r.creditAmount),sortValue:r=>r.creditAmount},
  {id:'status',header:'Return Status',cell:()=><StatusBadge>completed</StatusBadge>},
  {id:'date',header:'Created Date',cell:r=>formatDate(new Date(r.createdAt)),sortValue:r=>r.createdAt},
  {id:'branch',header:'Receiving Branch',cell:r=>branchService.get(receivingBranch(r.purchaseId))?.name??(receivingBranch(r.purchaseId)||'—')}
 ]} actions={r=><div className="commerce-actions"><button onClick={()=>setView(r.id)} aria-label={`View ${r.returnNo}`}><Eye size={15}/></button></div>}/>
 </div>{open&&<PurchaseReturnFlow initialPurchase={params.get('purchase')??''} onClose={()=>{setOpen(false);setParams(p=>{p.delete('purchase');return p;},{replace:true});}}/>}<Drawer open={!!record} title={record?.returnNo??'Return details'} onClose={()=>setView('')}>{record&&<div className="space-y-5"><SupplierIdentity id={record.supplierId} email/><p><Link className="text-indigo-600" to={`/purchases/${record.purchaseId}`}>{purchase?.purchaseNo??record.purchaseId}</Link> · {formatDate(new Date(record.createdAt))}</p><p>{record.reason}</p><StatusBadge>completed</StatusBadge><DataTable caption="Returned items" rows={record.items} rowKey={l=>l.purchaseLineId} columns={[{id:'product',header:'Product',cell:l=>{const line=purchase?.items.find(x=>x.id===l.purchaseLineId);return <span className="commerce-product"><ProductImage name={line?.name??'Product'}/>{line?.name??l.purchaseLineId}</span>;}},{id:'qty',header:'Quantity',cell:l=>l.quantity},{id:'cost',header:'Unit Cost',cell:l=>formatPHP(l.unitCost)}]}/><p className="text-lg font-semibold"><T text={"Supplier credit: "}/>{formatPHP(record.creditAmount)}</p></div>}</Drawer></CommerceWorkspace>;
}
