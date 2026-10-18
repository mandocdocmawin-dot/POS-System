import {formatDate as displayDate} from '../../utils/date';
import {useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {PageActions} from '../../components/common/PageActions';
import {DataTable} from '../../components/common/DataTable';
import {EntityLink} from '../../components/common/EntityLink';
import {PurchaseReturnFlow} from '../../components/purchases/PurchaseReturnFlow';
import {purchaseService} from '../../services/purchaseService';
import {supplierService} from '../../services/supplierService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
export function Component(){useLocalData();const [params,setParams]=useSearchParams(),[open,setOpen]=useState(!!params.get('purchase')),[supplier,setSupplier]=useState('');const rows=purchaseService.returns().filter(r=>!supplier||r.supplierId===supplier);return <><PageActions title="Purchase Returns"><button className="btn-primary" onClick={()=>setOpen(true)}>New return</button></PageActions><select className="mb-4" aria-label="Supplier filter" value={supplier} onChange={e=>setSupplier(e.target.value)}><option value="">All suppliers</option>{supplierService.list().map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><div className="panel"><DataTable caption="Purchase returns" rows={rows} rowKey={r=>r.id} searchText={r=>`${r.returnNo} ${r.reason}`} columns={[{id:'no',header:'Return No',cell:r=>r.returnNo},{id:'date',header:'Date',cell:r=>displayDate(new Date(r.createdAt))},{id:'purchase',header:'Purchase',cell:r=><EntityLink type="purchases" id={r.purchaseId}>{purchaseService.get(r.purchaseId)?.purchaseNo??r.purchaseId}</EntityLink>},{id:'supplier',header:'Supplier',cell:r=><EntityLink type="suppliers" id={r.supplierId}>{supplierService.get(r.supplierId)?.name??'—'}</EntityLink>},{id:'items',header:'Items',cell:r=>r.items.length},{id:'reason',header:'Reason',cell:r=>r.reason},{id:'credit',header:'Credit',cell:r=>formatPHP(r.creditAmount)}]}/></div>{open&&<PurchaseReturnFlow initialPurchase={params.get('purchase')??''} onClose={()=>{setOpen(false);setParams({},{replace:true});}}/>}</>;}
