import { T } from "../../i18n/T";
import {Can} from '../../components/auth/Can';
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Eye,Pencil,Plus,UserX} from 'lucide-react';
import {CommerceWorkspace,CommerceStats,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {CustomerIdentity} from '../../components/customers/CustomerIdentity';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {customerService} from '../../services/customerService';
import {orderService} from '../../services/orderService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
import {formatDate} from '../../utils/date';
export function Component(){
 useLocalData();
 const [tier,setTier]=useState(''),[status,setStatus]=useState(''),[balance,setBalance]=useState(false),[selected,setSelected]=useState<string[]>([]),[deactivate,setDeactivate]=useState('');
 const customers=customerService.list(),named=customers.filter(c=>!c.isWalkIn),orders=orderService.list({branchId:'all'}),rows=named.filter(c=>(!tier||c.tier===tier)&&(!status||c.status===status)&&(!balance||c.creditBalance>0));
 const recent=new Date();recent.setDate(1);recent.setHours(0,0,0,0);
 return <CommerceWorkspace title="Customers List" section="Customers"><CommerceStats customers items={[
  {label:'Total Customers',value:named.length,detail:'Registered customer accounts'},
  {label:'Active Customers',value:named.filter(c=>c.status==='active').length,detail:'Available for orders'},
  {label:'VIP Customers',value:named.filter(c=>c.tier!=='Regular').length,detail:'Silver, Gold & Platinum members'},
  {label:'New Customers',value:named.filter(c=>new Date(c.createdAt)>=recent).length,detail:'Joined this month'},
  {label:'Inactive Customers',value:named.filter(c=>c.status==='inactive').length,detail:'Accounts for follow-up'}
 ]}/><div className="panel"><CommercePanelHeading title="Customers List" subtitle={`Total customers: ${named.length}`}><Can permission="customers:edit"><Link className="btn-primary" to="/customers/add-customer"><Plus size={16}/><T text={"Add Customer"}/></Link></Can></CommercePanelHeading><div className="commerce-filters"><select aria-label="Customer tier" value={tier} onChange={e=>setTier(e.target.value)}><option value=""><T text={"All customer types"}/></option>{['Regular','Silver','Gold','Platinum'].map(x=><option key={x}>{x}</option>)}</select><select aria-label="Customer status" value={status} onChange={e=>setStatus(e.target.value)}><option value=""><T text={"All statuses"}/></option><option value="active"><T text={"Active"}/></option><option value="inactive"><T text={"Inactive"}/></option></select><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={balance} onChange={e=>setBalance(e.target.checked)}/>Has balance owed</label></div><DataTable caption="Customers" rows={rows} rowKey={c=>c.id} searchText={c=>`${c.id} ${c.name} ${c.phone??''} ${c.email??''}`} selection={selected} onSelectionChange={setSelected} columns={[
 {id:'id',header:'Customer ID',cell:c=><Link className="commerce-muted" to={`/customers/${c.id}`}>#{c.id.replace('customer-','CUS').toUpperCase()}</Link>},
 {id:'name',header:'Customer',cell:c=><CustomerIdentity id={c.id}/>,sortValue:c=>c.name},
 {id:'phone',header:'Phone',cell:c=>c.phone??'—'},
 {id:'city',header:'Location',cell:c=>c.address??'—'},
 {id:'orders',header:'Orders',cell:c=><Link to={`/orders/all-orders?customer=${encodeURIComponent(c.id)}`}>{customerService.stats(c.id).count}</Link>,sortValue:c=>customerService.stats(c.id).count},
 {id:'spent',header:'Total Spend',cell:c=><strong>{formatPHP(customerService.stats(c.id).spent)}</strong>,sortValue:c=>customerService.stats(c.id).spent},
 {id:'type',header:'Customer Type',cell:c=><span className="btn !min-h-7 !text-xs"><span className={c.tier==='Regular'?'text-indigo-600':'text-indigo-600'}>•</span>{c.tier}</span>},
 {id:'last',header:'Last Order',cell:c=>{const last=orders.find(o=>o.customerId===c.id);return last?<Link to={`/orders/${last.id}`}>{formatDate(new Date(last.createdAt))}</Link>:'—';}},
 {id:'status',header:'Status',cell:c=><StatusBadge>{c.status}</StatusBadge>}
 ]} actions={c=><div className="commerce-actions"><Link to={`/customers/${c.id}`} aria-label={`View ${c.name}`}><Eye size={15}/></Link>{!c.isWalkIn&&<Can permission="customers:manage"><Link className="edit" to={`/customers/${c.id}/edit`} aria-label={`Edit ${c.name}`}><Pencil size={15}/></Link><button className="danger" disabled={c.status==='inactive'} onClick={()=>setDeactivate(c.id)} aria-label={`Deactivate ${c.name}`}><UserX size={15}/></button></Can>}</div>}/></div><ConfirmDialog open={!!deactivate} title="Deactivate customer?" message="The customer’s orders, wallet, and history will remain available." onClose={()=>setDeactivate('')} onConfirm={()=>{customerService.update(deactivate,{status:'inactive'});setDeactivate('');}}/></CommerceWorkspace>;
}
