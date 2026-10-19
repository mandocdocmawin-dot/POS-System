import {useState} from 'react';
import {Plus,Eye,Pencil,Trash2} from 'lucide-react';
import {AccountStatement} from '../../components/accounts/AccountStatement';
import {accountService} from '../../services/accountService';
import {ledgerService} from '../../services/ledgerService';
import {useLocalData} from '../../services/useLocalData';
import {usePermission} from '../../hooks/usePermission';
import {payrollMoney} from '../../utils/money';
import {formatDate} from '../../utils/date';
import {AccountsShell} from '../../components/accounts/AccountsShell';
import {AccountEditor} from '../../components/accounts/AccountEditor';
import {CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {ConfirmDialog} from '../../components/common/ConfirmDialog';
import {Avatar} from '../../components/common/Avatar';
import type {BankAccount} from '../../types/accounts';
export function Component(){
 useLocalData();const accounts=accountService.list(),{can}=usePermission(),manage=can('accounts:manage');
 const [edit,setEdit]=useState<BankAccount|null|undefined>(undefined),[remove,setRemove]=useState(''),[statement,setStatement]=useState<BankAccount|null>(null),[type,setType]=useState(''),[status,setStatus]=useState(''),[selected,setSelected]=useState<string[]>([]);
 const entries=ledgerService.getEntries(),rows=accounts.filter(a=>(!type||a.type===type)&&(!status||a.status===status));
 return <AccountsShell title="Bank Accounts"><section className="panel"><CommercePanelHeading title="Bank Accounts" subtitle={`Total active balance: ${payrollMoney(accountService.total())}`}><select aria-label="Account type" value={type} onChange={e=>setType(e.target.value)}><option value="">Type</option><option value="bank">Bank</option><option value="cash">Cash</option><option value="ewallet">E-wallet</option></select><select aria-label="Account status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Status</option><option value="active">Active</option><option value="inactive">Inactive</option></select><span className="btn">PHP</span>{manage&&<button className="btn-primary" onClick={()=>setEdit(null)}><Plus size={16}/>Add Accounts</button>}</CommercePanelHeading>
 <DataTable caption="Bank accounts" rows={rows} rowKey={a=>a.id} selection={selected} onSelectionChange={setSelected} searchText={a=>`${a.name} ${a.bankName??''} ${a.accountHolder??''} ${a.accountNo??''}`} columns={[
  {id:'bank',header:'Bank Name',cell:a=><button onClick={()=>setStatement(a)}>{a.bankName||a.name}</button>,sortValue:a=>a.bankName||a.name},
  {id:'holder',header:'Account Holder',cell:a=><span className="account-holder"><Avatar name={a.accountHolder||'Store account'}/>{a.accountHolder||'Store account'}</span>},
  {id:'no',header:'Account Number',cell:a=><strong>{a.accountNo?`Ends in **** ${a.accountNo.replace(/\D/g,'').slice(-4)||a.accountNo.slice(-4)}`:'—'}</strong>},
  {id:'type',header:'Type',cell:a=><span className="capitalize">{a.type==='ewallet'?'E-wallet':`${a.type} account`}</span>},
  {id:'currency',header:'Currency',cell:()=>'PHP'},
  {id:'balance',header:'Balance',cell:a=>payrollMoney(a.balance),sortValue:a=>a.balance},
  {id:'status',header:'Status',cell:a=><StatusBadge>{a.status}</StatusBadge>},
  {id:'last',header:'Last Transaction',cell:a=>{const last=entries.filter(e=>e.accountId===a.id).at(-1);return last?formatDate(last.date):'—';}}
 ]} actions={a=><div className="commerce-actions"><button onClick={()=>setStatement(a)} aria-label={`View ${a.name} statement`}><Eye size={15}/></button>{manage&&<><button className="edit" onClick={()=>setEdit(a)} aria-label={`Edit ${a.name}`}><Pencil size={15}/></button><button className="danger" onClick={()=>setRemove(a.id)} aria-label={`Delete ${a.name}`}><Trash2 size={15}/></button></>}</div>}/>
 </section>{statement&&<AccountStatement account={statement} onClose={()=>setStatement(null)}/ >}{edit!==undefined&&<AccountEditor account={edit??undefined} onClose={()=>setEdit(undefined)}/>}<ConfirmDialog open={!!remove} title="Delete account?" message="Accounts with history must be deactivated instead." onClose={()=>setRemove('')} onConfirm={()=>accountService.remove(remove)}/></AccountsShell>;
}
