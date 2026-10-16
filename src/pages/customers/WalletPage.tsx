import {useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {PageActions} from '../../components/common/PageActions';
import {DataTable} from '../../components/common/DataTable';
import {SummaryCards} from '../../components/common/SummaryCards';
import {Timeline} from '../../components/common/Timeline';
import {Drawer} from '../../components/common/Drawer';
import {EntityLink} from '../../components/common/EntityLink';
import {WalletAction} from '../../components/customers/WalletAction';
import {customerService} from '../../services/customerService';
import {walletService} from '../../services/walletService';
import {useLocalData} from '../../services/useLocalData';
import {toCentavos,fromCentavos} from '../../utils/pos';
import {formatPHP} from '../../utils/money';
export function Component(){useLocalData();const [params]=useSearchParams(),[action,setAction]=useState<{id:string;mode:'topup'|'adjustment'}|null>(()=>params.get('customer')?{id:params.get('customer')!,mode:'topup'}:null),[history,setHistory]=useState('');const rows=customerService.list().filter(c=>!c.isWalkIn);return <><PageActions title="Wallet Balance"/><SummaryCards items={[{label:'Total wallet liabilities',value:formatPHP(fromCentavos(rows.reduce((n,c)=>n+toCentavos(c.walletBalance),0)))},{label:'Customers with balance',value:rows.filter(c=>c.walletBalance>0).length}]}/><div className="panel"><DataTable caption="Customer wallets" rows={rows} rowKey={c=>c.id} searchText={c=>c.name} columns={[{id:'name',header:'Customer',cell:c=><EntityLink type="customers" id={c.id}>{c.name}</EntityLink>},{id:'wallet',header:'Wallet funds',cell:c=>formatPHP(c.walletBalance),sortValue:c=>c.walletBalance},{id:'credit',header:'Credit owed',cell:c=>formatPHP(c.creditBalance)}]} actions={c=><div className="flex gap-2"><button className="btn" onClick={()=>setAction({id:c.id,mode:'topup'})}>Top up</button><button className="btn" onClick={()=>setAction({id:c.id,mode:'adjustment'})}>Adjust</button><button className="btn" onClick={()=>setHistory(c.id)}>History</button></div>}/></div>{action&&<WalletAction key={`${action.id}-${action.mode}`} customerId={action.id} mode={action.mode} onClose={()=>setAction(null)}/>}<Drawer open={!!history} title={`${customerService.get(history)?.name??''} · Wallet history`} onClose={()=>setHistory('')}><Timeline items={walletService.list(history).map(t=>({...t,description:`${t.type} ${formatPHP(t.amount)} · Balance after ${formatPHP(t.balanceAfter)} · ${t.method??''} · ${t.reference??''} · ${t.note??''}`}))}/></Drawer></>;}
