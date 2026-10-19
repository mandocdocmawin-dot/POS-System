import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Download,Eye,Pencil,Plus,UserX} from 'lucide-react';
import {CommerceWorkspace,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {SupplierIdentity} from '../../components/suppliers/SupplierIdentity';
import {Can} from '../../components/auth/Can';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
import {supplierService} from '../../services/supplierService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
import {exportCSV} from '../../utils/csv';

export function Component(){
 useLocalData();
 const [status,setStatus]=useState(''),[selected,setSelected]=useState<string[]>([]),[deactivate,setDeactivate]=useState('');
 const rows=supplierService.list().filter(s=>!status||s.status===status);
 return <CommerceWorkspace title="Suppliers List" section="Suppliers"><div className="panel">
  <CommercePanelHeading title="Suppliers List" subtitle={`${rows.length} suppliers`}>
   <select aria-label="Supplier status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Select Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
   <button className="btn" onClick={()=>exportCSV('suppliers.csv',[['Supplier ID','Supplier','Company','Total Purchase','Contact','Email','Status','Country'],...rows.map(s=>[s.id,s.name,s.companyName??s.name,supplierService.report(s.id).total,s.phone??'',s.email??'',s.status,s.country??''])])}><Download size={15}/>Export As CSV</button>
   <Can permission="suppliers:manage"><Link className="btn-primary" to="/suppliers/add-supplier"><Plus size={16}/>Add Supplier</Link></Can>
  </CommercePanelHeading>
  <DataTable caption="Suppliers" rows={rows} rowKey={s=>s.id} searchText={s=>`${s.id} ${s.name} ${s.companyName??''} ${s.contactPerson??''} ${s.phone??''} ${s.email??''}`} selection={selected} onSelectionChange={setSelected} columns={[
   {id:'id',header:'Supplier ID',cell:s=><Link to={`/suppliers/${s.id}`}>#{s.id.startsWith('supplier-')?`SUP-${s.id.slice(9).padStart(4,'0')}`:s.id.slice(0,8).toUpperCase()}</Link>},
   {id:'supplier',header:'Supplier',cell:s=><SupplierIdentity id={s.id}/>,sortValue:s=>s.name},
   {id:'company',header:'Company Name',cell:s=>s.companyName||s.name},
   {id:'total',header:'Total Purchase',cell:s=><Link to={`/purchases/purchase?supplier=${encodeURIComponent(s.id)}`}>{formatPHP(supplierService.report(s.id).total)}</Link>,sortValue:s=>supplierService.report(s.id).total},
   {id:'phone',header:'Contact',cell:s=>s.phone||'—'},
   {id:'email',header:'Email',cell:s=>s.email||'—'},
   {id:'status',header:'Status',cell:s=><StatusBadge>{s.status}</StatusBadge>},
   {id:'country',header:'Country',cell:s=>s.country||'—'}
  ]} actions={s=><div className="commerce-actions"><Link to={`/suppliers/${s.id}`} aria-label={`View ${s.name}`}><Eye size={15}/></Link><Can permission="suppliers:manage"><Link className="edit" to={`/suppliers/${s.id}/edit`} aria-label={`Edit ${s.name}`}><Pencil size={15}/></Link><button className="danger" disabled={s.status==='inactive'} onClick={()=>setDeactivate(s.id)} aria-label={`Deactivate ${s.name}`}><UserX size={15}/></button></Can></div>}/>
 </div><ConfirmDialog open={!!deactivate} title="Deactivate supplier?" message="Purchase records, balances, and payment history will remain available." onClose={()=>setDeactivate('')} onConfirm={()=>{const supplier=supplierService.get(deactivate);if(supplier)supplierService.save({...supplier,status:'inactive'},supplier.id);setDeactivate('');}}/></CommerceWorkspace>;
}
