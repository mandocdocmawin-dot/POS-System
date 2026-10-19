import { T } from "../../i18n/T";
import {useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Plus,Download,Eye,PackageCheck,CreditCard,Undo2,X} from 'lucide-react';
import {CommerceWorkspace,CommerceStats,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {SupplierIdentity} from '../../components/suppliers/SupplierIdentity';
import {Can} from '../../components/auth/Can';
import {DataTable} from '../../components/common/DataTable';
import {DateRangeFilter,type DateRange} from '../../components/common/DateRangeFilter';
import {StatusBadge} from '../../components/common/StatusBadge';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
import {ReceiveStock} from '../../components/purchases/ReceiveStock';
import {purchaseService} from '../../services/purchaseService';
import {supplierService} from '../../services/supplierService';
import {useLocalData} from '../../services/useLocalData';
import {toCentavos,fromCentavos} from '../../utils/pos';
import {formatPHP} from '../../utils/money';
import {formatDate} from '../../utils/date';
import {inDateRange} from '../../utils/dateRange';
import {exportCSV} from '../../utils/csv';

export function Component(){
 useLocalData();const [params]=useSearchParams();
 const [supplier,setSupplier]=useState(params.get('supplier')??''),[payment,setPayment]=useState(''),[receive,setReceive]=useState(''),[range,setRange]=useState<DateRange>({from:'',to:''}),[cancel,setCancel]=useState(''),[receiving,setReceiving]=useState(''),[selected,setSelected]=useState<string[]>([]);
 const all=purchaseService.list(),rows=all.filter(p=>(!supplier||p.supplierId===supplier)&&(!payment||p.paymentStatus===payment)&&(!receive||p.receiveStatus===receive)&&inDateRange(p.date+'T12:00:00',range)),valid=all.filter(p=>p.receiveStatus!=='cancelled');
 const sum=(key:'grandTotal'|'amountPaid'|'balanceDue')=>formatPHP(fromCentavos(valid.reduce((n,p)=>n+toCentavos(p[key]),0))),receipt=receiving?purchaseService.get(receiving):undefined;
 return <CommerceWorkspace title="Purchase" section="Purchases"><CommerceStats items={[
  {label:'Total Purchases',value:sum('grandTotal'),detail:'Value of active purchase orders'},
  {label:'Total Orders',value:all.length,detail:'All purchase records'},
  {label:'Pending Orders',value:valid.filter(p=>p.receiveStatus!=='received').length,detail:'Awaiting full stock receipt'},
  {label:'Returned Items',value:purchaseService.returns().reduce((n,r)=>n+r.items.reduce((q,l)=>q+l.quantity,0),0),detail:'Units returned to suppliers'},
  {label:'Total Payments',value:sum('amountPaid'),detail:`Outstanding: ${sum('balanceDue')}`}
 ]}/><div className="panel"><CommercePanelHeading title="Purchases List" subtitle="View and manage purchase records including suppliers and items."><button className="btn" onClick={()=>exportCSV('purchases.csv',[['Purchase ID','Supplier','Receive Status','Items','Total','Paid','Balance','Payment Status','Date'],...rows.map(p=>[p.purchaseNo,supplierService.get(p.supplierId)?.name??'',p.receiveStatus,p.items.reduce((n,l)=>n+l.orderedQty,0),p.grandTotal,p.amountPaid,p.balanceDue,p.paymentStatus,p.date])])}><Download size={15}/><T text={"Export As CSV"}/></button><Can permission="purchases:create"><Link className="btn-primary" to="/purchases/add-purchase"><Plus size={16}/><T text={"Add Purchase"}/></Link></Can></CommercePanelHeading>
 <div className="commerce-filters"><select aria-label="Purchase status" value={receive} onChange={e=>setReceive(e.target.value)}><option value=""><T text={"Purchase Status"}/></option>{['pending','partial','received','cancelled'].map(s=><option key={s}>{s}</option>)}</select><select aria-label="Payment status" value={payment} onChange={e=>setPayment(e.target.value)}><option value=""><T text={"Payment Status"}/></option>{['paid','partial','unpaid'].map(s=><option key={s}>{s}</option>)}</select><DateRangeFilter value={range} onChange={setRange}/><select aria-label="Supplier" value={supplier} onChange={e=>setSupplier(e.target.value)}><option value=""><T text={"All suppliers"}/></option>{supplierService.list().map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
 <DataTable caption="Purchases" rows={rows} rowKey={p=>p.id} selection={selected} onSelectionChange={setSelected} searchText={p=>`${p.purchaseNo} ${supplierService.get(p.supplierId)?.name??''} ${p.items.map(l=>`${l.name} ${l.sku}`).join(' ')}`} columns={[
  {id:'id',header:'Purchase ID',cell:p=><Link to={`/purchases/${p.id}`}>{p.purchaseNo}</Link>,sortValue:p=>p.purchaseNo},
  {id:'supplier',header:'Supplier',cell:p=><SupplierIdentity id={p.supplierId}/>},
  {id:'receive',header:'Purchase Status',cell:p=><div className="flex items-center gap-2"><span className="purchase-receipt-indicator" data-received={p.receiveStatus==='received'} aria-hidden="true"><i/></span><StatusBadge>{p.receiveStatus}</StatusBadge></div>},
  {id:'items',header:'Items',cell:p=><Link to={`/purchases/${p.id}`}>{p.items.reduce((n,l)=>n+l.orderedQty,0)}<T text={" Items"}/></Link>},
  {id:'total',header:'Total Amount',cell:p=>formatPHP(p.grandTotal),sortValue:p=>p.grandTotal},
  {id:'payment',header:'Payment Status',cell:p=><StatusBadge>{p.paymentStatus}</StatusBadge>},
  {id:'date',header:'Date',cell:p=>formatDate(new Date(`${p.date}T00:00:00`)),sortValue:p=>p.date}
 ]} actions={p=><div className="commerce-actions"><Link to={`/purchases/${p.id}`} aria-label={`View ${p.purchaseNo}`}><Eye size={15}/></Link><Can permission="purchases:create">{p.receiveStatus!=='cancelled'&&<>{p.receiveStatus!=='received'&&<button className="edit" onClick={()=>setReceiving(p.id)} aria-label={`Receive stock for ${p.purchaseNo}`}><PackageCheck size={15}/></button>}{p.balanceDue>0&&<Link to={`/suppliers/payments?supplier=${p.supplierId}&purchase=${p.id}`} aria-label={`Pay ${p.purchaseNo}`}><CreditCard size={15}/></Link>}{p.items.some(l=>l.receivedQty>0)&&<Link className="edit" to={`/purchases/returns?purchase=${p.id}`} aria-label={`Return items from ${p.purchaseNo}`}><Undo2 size={15}/></Link>}{!p.amountPaid&&p.items.every(l=>!l.receivedQty)&&<button className="danger" onClick={()=>setCancel(p.id)} aria-label={`Cancel ${p.purchaseNo}`}><X size={15}/></button>}</>}</Can></div>}/>
 </div>{receipt&&<ReceiveStock key={receipt.id} purchase={receipt} onClose={()=>setReceiving('')}/>}<ConfirmDialog open={!!cancel} title="Cancel purchase?" message="Cancel this purchase? No stock has been received or payments recorded." onClose={()=>setCancel('')} onConfirm={()=>purchaseService.cancel(cancel)}/></CommerceWorkspace>;
}
