import { T } from "../../i18n/T";
import {formatDate as displayDate} from '../../utils/date';
import {inDateRange} from '../../utils/dateRange';
import {useState} from 'react';
import {DataTable} from '../common/DataTable';
import {DateRangeFilter,type DateRange} from '../common/DateRangeFilter';
import {EntityLink} from '../common/EntityLink';
import {supplierPaymentService} from '../../services/supplierPaymentService';
import {supplierService} from '../../services/supplierService';
import {purchaseService} from '../../services/purchaseService';
import {formatPHP} from '../../utils/money';
export function SupplierPaymentsTable({purchasesOnly=false,initialSupplier=''}:{purchasesOnly?:boolean;initialSupplier?:string}){const [supplier,setSupplier]=useState(initialSupplier),[method,setMethod]=useState(''),[range,setRange]=useState<DateRange>({from:'',to:''});const rows=supplierPaymentService.list(supplier||undefined).filter(p=>(!purchasesOnly||p.purchaseId)&&(!method||p.method===method)&&inDateRange(p.createdAt,range));return <><div className="mb-4 flex flex-wrap gap-3"><select aria-label="Filter supplier" value={supplier} onChange={e=>setSupplier(e.target.value)}><option value=""><T text={"All suppliers"}/></option>{supplierService.list().map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select aria-label="Filter payment method" value={method} onChange={e=>setMethod(e.target.value)}><option value=""><T text={"All methods"}/></option>{['cash','gcash','maya','card','bank'].map(x=><option key={x}>{x}</option>)}</select><DateRangeFilter value={range} onChange={setRange}/></div><DataTable caption="Supplier payments" rows={rows} rowKey={p=>p.id} searchText={p=>`${supplierService.get(p.supplierId)?.name} ${p.reference??''}`} columns={[{id:'date',header:'Date',cell:p=>displayDate(new Date(p.createdAt))},{id:'supplier',header:'Supplier',cell:p=><EntityLink type="suppliers" id={p.supplierId}>{supplierService.get(p.supplierId)?.name??'—'}</EntityLink>},{id:'purchase',header:'Purchase',cell:p=>p.purchaseId?<EntityLink type="purchases" id={p.purchaseId}>{purchaseService.get(p.purchaseId)?.purchaseNo??p.purchaseId}</EntityLink>:'—'},{id:'amount',header:'Amount',cell:p=>formatPHP(p.amount)},{id:'method',header:'Method',cell:p=>p.method},{id:'reference',header:'Reference',cell:p=>p.reference??'—'}]}/></>;}
