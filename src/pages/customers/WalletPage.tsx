import { T } from "../../i18n/T";
import {useState} from 'react';
import {useSearchParams,Link} from 'react-router-dom';
import {Plus,Eye,Pencil} from 'lucide-react';
import {CommerceWorkspace,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {CustomerIdentity} from '../../components/customers/CustomerIdentity';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {Timeline} from '../../components/common/Timeline';
import {Drawer} from '../../components/common/Drawer';
import {Modal} from '../../components/common/Modal';
import {Can} from '../../components/auth/Can';
import {DateRangeFilter,type DateRange} from '../../components/common/DateRangeFilter';
import {WalletAction} from '../../components/customers/WalletAction';
import {customerService} from '../../services/customerService';
import {walletService} from '../../services/walletService';
import {useLocalData} from '../../services/useLocalData';
import {toCentavos,fromCentavos} from '../../utils/pos';
import {formatPHP} from '../../utils/money';
import {formatDate} from '../../utils/date';
import {inDateRange} from '../../utils/dateRange';
export function Component(){
 useLocalData();const [params]=useSearchParams(),[action,setAction]=useState<{id:string;mode:'topup'|'adjustment'}|null>(()=>params.get('customer')?{id:params.get('customer')!,mode:'topup'}:null),[history,setHistory]=useState(''),[choose,setChoose]=useState(false),[status,setStatus]=useState(''),[min,setMin]=useState(''),[max,setMax]=useState(''),[selected,setSelected]=useState<string[]>([]),[range,setRange]=useState<DateRange>({from:'',to:''});
 const customers=customerService.list().filter(c=>!c.isWalkIn),transactions=walletService.list(),rows=customers.filter(c=>{const last=transactions.find(t=>t.customerId===c.id);return (!status||c.status===status)&&(min===''||c.walletBalance>=Number(min))&&(max===''||c.walletBalance<=Number(max))&&(!range.from&&!range.to||!!last&&inDateRange(last.createdAt,range));});
 const sum=(id:string,credit:boolean)=>formatPHP(fromCentavos(transactions.filter(t=>t.customerId===id&&(credit?t.amount>0:t.amount<0)).reduce((n,t)=>n+toCentavos(Math.abs(t.amount)),0)));
 return <CommerceWorkspace title="Wallet Balance" section="Customers"><div className="panel"><CommercePanelHeading title="Wallet Balance" subtitle={`Total wallet funds: ${formatPHP(fromCentavos(customers.reduce((n,c)=>n+toCentavos(c.walletBalance),0)))}`}><Can permission="customers:manage"><button className="btn-primary" onClick={()=>setChoose(true)}><Plus size={16}/><T text={"Add Balance"}/></button></Can></CommercePanelHeading><div className="commerce-filters"><DateRangeFilter value={range} onChange={setRange}/><select aria-label="Wallet status" value={status} onChange={e=>setStatus(e.target.value)}><option value=""><T text={"Select Status"}/></option><option value="active"><T text={"Active"}/></option><option value="inactive"><T text={"Inactive"}/></option></select><input className="w-36" type="number" min="0" aria-label="Minimum balance" placeholder="Min Balance" value={min} onChange={e=>setMin(e.target.value)}/><input className="w-36" type="number" min="0" aria-label="Maximum balance" placeholder="Max Balance" value={max} onChange={e=>setMax(e.target.value)}/></div><DataTable caption="Customer wallets" rows={rows} rowKey={c=>c.id} selection={selected} onSelectionChange={setSelected} searchText={c=>`${c.id} ${c.name} ${c.phone??''} ${c.email??''}`} columns={[
 {id:'id',header:'Customer ID',cell:c=><Link to={`/customers/${c.id}`}>#{c.id.replace('customer-','CUS').toUpperCase()}</Link>},
 {id:'name',header:'Customer',cell:c=><CustomerIdentity id={c.id}/>,sortValue:c=>c.name},
 {id:'phone',header:'Phone',cell:c=>c.phone??'—'},
 {id:'wallet',header:'Wallet Balance',cell:c=><strong className="text-emerald-600">{formatPHP(c.walletBalance)}</strong>,sortValue:c=>c.walletBalance},
 {id:'credit',header:'Total Credit',cell:c=>sum(c.id,true)},
 {id:'debit',header:'Total Debit',cell:c=>sum(c.id,false)},
 {id:'status',header:'Wallet Status',cell:c=><StatusBadge>{c.status}</StatusBadge>},
 {id:'last',header:'Last Wallet Txn',cell:c=>{const last=transactions.find(t=>t.customerId===c.id);return last?formatDate(new Date(last.createdAt)):'—';}}
 ]} actions={c=><div className="commerce-actions"><button onClick={()=>setHistory(c.id)} aria-label={`View ${c.name} wallet history`}><Eye size={15}/></button><Can permission="customers:manage"><button className="edit" onClick={()=>setAction({id:c.id,mode:'adjustment'})} aria-label={`Adjust ${c.name} wallet`}><Pencil size={15}/></button><button onClick={()=>setAction({id:c.id,mode:'topup'})} aria-label={`Top up ${c.name} wallet`}><Plus size={15}/></button></Can></div>}/></div>{action&&<WalletAction key={`${action.id}-${action.mode}`} customerId={action.id} mode={action.mode} onClose={()=>setAction(null)}/>}<Modal open={choose} title="Add wallet balance" onClose={()=>setChoose(false)}><p className="mb-4 text-sm">Select a customer to top up their wallet.</p><div className="grid gap-2 max-h-96 overflow-y-auto">{customers.map(c=><button className="btn justify-between" key={c.id} onClick={()=>{setChoose(false);setAction({id:c.id,mode:'topup'});}}>{c.name}<span>{formatPHP(c.walletBalance)}</span></button>)}{!customers.length&&<Link className="btn-primary" to="/customers/add-customer"><T text={"Add a customer"}/></Link>}</div></Modal><Drawer open={!!history} title={`${customerService.get(history)?.name??''} · Wallet history`} onClose={()=>setHistory('')}><Timeline items={walletService.list(history).map(t=>({...t,description:`${t.type} ${formatPHP(t.amount)} · Balance after ${formatPHP(t.balanceAfter)} · ${t.method??''} · ${t.reference??''} · ${t.note??''}`}))}/></Drawer></CommerceWorkspace>;
}
