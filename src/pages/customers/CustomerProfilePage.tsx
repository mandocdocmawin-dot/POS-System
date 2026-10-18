import {EmailRecordLink} from '../../components/email/EmailRecordLink';
import {Can} from '../../components/auth/Can';
import {useState} from 'react';
import {useParams,Link} from 'react-router-dom';
import {PageActions} from '../../components/common/PageActions';
import {Tabs} from '../../components/common/Tabs';
import {SummaryCards} from '../../components/common/SummaryCards';
import {Timeline} from '../../components/common/Timeline';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
import {OrderTable} from '../../components/orders/OrderTable';
import {CollectBalance} from '../../components/orders/CollectBalance';
import {customerService} from '../../services/customerService';
import {orderService} from '../../services/orderService';
import {walletService} from '../../services/walletService';
import {activityService} from '../../services/activityService';
import {useLocalData} from '../../services/useLocalData';
import {formatPHP} from '../../utils/money';
export function Component(){useLocalData();const {id=''}=useParams(),[tab,setTab]=useState('Overview'),[deactivate,setDeactivate]=useState(false);const c=customerService.get(id);if(!c)return <p role="alert">Customer not found. <Link to="/customers">Customer List</Link></p>;const stats=customerService.stats(id),orders=orderService.list({branchId:'all'}).filter(o=>o.customerId===id);return <><PageActions title={c.name}>{!c.isWalkIn&&<Can permission="customers:manage"><Link className="btn" to={`/customers/${id}/edit`}>Edit</Link><Link className="btn" to={`/customers/wallet?customer=${id}`}>Top up wallet</Link><CollectBalance customerId={id} balance={c.creditBalance}/><button className="btn" disabled={c.status==='inactive'} onClick={()=>setDeactivate(true)}>Deactivate</button></Can>}</PageActions>{c.creditBalance>0&&<div className="mb-4"><EmailRecordLink type="payment-reminder" id={id} label="Send payment reminder (demo)"/></div>}<SummaryCards items={[{label:'Wallet prepaid funds',value:formatPHP(c.walletBalance)},{label:'Credit owed to shop',value:formatPHP(c.creditBalance)},{label:'Orders',value:stats.count},{label:'Total spent',value:formatPHP(stats.spent)}]}/><Tabs items={['Overview','Orders','Payments','Wallet','Activity']} value={tab} onChange={setTab}/><div className="panel p-5">{tab==='Overview'?<div className="grid gap-4 sm:grid-cols-2"><p>Phone: {c.phone??'—'}</p><p>Email: {c.email??'—'}</p><p>Address: {c.address??'—'}</p><p>Status: {c.status}</p><p>Tier: {c.tier} · {c.points} points</p><p>Notes: {c.notes??'—'}</p></div>:tab==='Orders'?<OrderTable rows={orders}/>:tab==='Payments'?<Timeline items={orderService.payments(id).map(p=>({...p,description:`${p.method}: ${formatPHP(p.amount)} · ${orderService.get(p.orderId??'')?.orderNo??'Balance payment'} · ${p.reference??''}`}))}/>:tab==='Wallet'?<Timeline items={walletService.list(id).map(t=>({...t,description:`${t.type}: ${formatPHP(t.amount)} · Balance after: ${formatPHP(t.balanceAfter)} · ${t.note??''}`}))}/>:<Timeline items={activityService.list().filter(a=>a.entityId===id||orders.some(o=>o.id===a.entityId))}/>}</div><ConfirmDialog open={deactivate} title="Deactivate customer?" message="Existing orders, wallet funds, and balances remain available." onClose={()=>setDeactivate(false)} onConfirm={()=>{customerService.update(id,{status:'inactive'});}}/></>;}
