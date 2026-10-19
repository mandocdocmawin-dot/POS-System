import { T } from "../../i18n/T";
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Plus,Download,Eye,Printer,FileText} from 'lucide-react';
import {CommerceWorkspace,CommercePanelHeading} from '../../components/customers/CommerceWorkspace';
import {CustomerIdentity} from '../../components/customers/CustomerIdentity';
import {DataTable} from '../../components/common/DataTable';
import {StatusBadge} from '../../components/common/StatusBadge';
import {Can} from '../../components/auth/Can';
import {ReceiptDialog} from '../../components/pos/ReceiptDialog';
import {EmailRecordLink} from '../../components/email/EmailRecordLink';
import {orderService} from '../../services/orderService';
import {useLocalData} from '../../services/useLocalData';
import type {Order} from '../../types/pos';
import {formatPHP} from '../../utils/money';
import {formatDate} from '../../utils/date';
import {localDate} from '../../utils/attendance';
import {toCentavos,fromCentavos} from '../../utils/pos';
import {exportCSV} from '../../utils/csv';
const invoiceStatus=(o:Order,today:string)=>o.orderStatus==='cancelled'?'cancelled':o.balanceDue>0?(o.dueDate&&o.dueDate<today?'overdue':'unpaid'):'paid';
export function Component(){
 useLocalData();const [status,setStatus]=useState(''),[print,setPrint]=useState<Order|null>(null),[selected,setSelected]=useState<string[]>([]),today=localDate();
 const all=orderService.list({branchId:'all'}),valid=all.filter(o=>o.orderStatus!=='cancelled'),rows=all.filter(o=>!status||invoiceStatus(o,today)===status),groups=['paid','unpaid','overdue'];
 const total=fromCentavos(valid.reduce((n,o)=>n+toCentavos(o.grandTotal),0));
 return <CommerceWorkspace title="Invoices" section="Orders"><div className="panel commerce-invoice-summary"><CommercePanelHeading title="Invoices"><Can permission="pos:use"><Link className="btn-primary" to="/pos"><Plus size={16}/><T text={"Add Invoice"}/></Link></Can></CommercePanelHeading><div className="commerce-invoice-totals"><p>Total invoice value: <strong>{formatPHP(total)}</strong> | {valid.length}<T text={" Invoices"}/></p><p><T text={"Outstanding balance: "}/><strong>{formatPHP(fromCentavos(valid.reduce((n,o)=>n+toCentavos(o.balanceDue),0)))}</strong></p></div><div className="commerce-payment-bar" aria-label="Invoice status distribution">{groups.map((s,i)=><span key={s} style={{flex:valid.filter(o=>invoiceStatus(o,today)===s).length,background:['#059669','#d97706','#dc2626'][i]}}/>)}</div><div className="commerce-payment-legend">{groups.map((s,i)=>{const group=valid.filter(o=>invoiceStatus(o,today)===s);return <span key={s}><i style={{background:['#059669','#d97706','#dc2626'][i]}}/>{s==='unpaid'?'Due':s[0].toUpperCase()+s.slice(1)}: <strong>{group.length}<T text={" Invoices"}/></strong>, {formatPHP(fromCentavos(group.reduce((n,o)=>n+toCentavos(o.grandTotal),0)))}</span>;})}</div></div><div className="panel"><CommercePanelHeading title="Invoices"><button className="btn" onClick={()=>exportCSV('invoices.csv',[['Invoice','Order','Customer','Date','Due date','Amount','Discount','Tax','Status'],...rows.map(o=>[invoiceNo(o),o.orderNo,o.customerName,o.createdAt,o.dueDate??'',o.grandTotal,o.orderDiscount.amount+o.itemDiscountTotal,o.taxTotal,invoiceStatus(o,today)])])}><Download size={15}/><T text={"Export As"}/></button></CommercePanelHeading><div className="commerce-filters"><select aria-label="Invoice status" value={status} onChange={e=>setStatus(e.target.value)}><option value=""><T text={"All invoices"}/></option>{[...groups,'cancelled'].map(x=><option key={x}>{x}</option>)}</select><span className="commerce-muted text-xs">Invoices are linked to their original orders.</span></div><DataTable caption="Invoices" rows={rows} rowKey={o=>o.id} selection={selected} onSelectionChange={setSelected} searchText={o=>`${invoiceNo(o)} ${o.orderNo} ${o.customerName}`} columns={[
 {id:'invoice',header:'Invoice ID',cell:o=><Link to={`/orders/${o.id}`} className="inline-flex items-center gap-2"><FileText size={18} className="text-indigo-600"/>{invoiceNo(o)}</Link>,sortValue:o=>o.orderNo},
 {id:'order',header:'Order ID',cell:o=><Link to={`/orders/${o.id}`}>{o.orderNo}</Link>},
 {id:'date',header:'Invoice Date',cell:o=>formatDate(new Date(o.createdAt)),sortValue:o=>o.createdAt},
 {id:'due',header:'Due Date',cell:o=>o.dueDate?formatDate(new Date(`${o.dueDate}T00:00:00`)):'—'},
 {id:'customer',header:'Customer',cell:o=><CustomerIdentity id={o.customerId} name={o.customerName} email={false}/>},
 {id:'status',header:'Payment Status',cell:o=><StatusBadge>{invoiceStatus(o,today)}</StatusBadge>},
 {id:'amount',header:'Amount',cell:o=><>{formatPHP(o.grandTotal)}<small className="commerce-muted"> / {o.payments[0]?.method??'Pay later'}</small></>,sortValue:o=>o.grandTotal},
 {id:'discount',header:'Discount',cell:o=>formatPHP(o.orderDiscount.amount+o.itemDiscountTotal)},
 {id:'tax',header:'Tax',cell:o=>formatPHP(o.taxTotal)},
 {id:'cashier',header:'Created By',cell:o=>o.cashier}
 ]} actions={o=><div className="flex items-center gap-2"><div className="commerce-actions"><Link to={`/orders/${o.id}`} aria-label={`View invoice ${invoiceNo(o)}`}><Eye size={15}/></Link><button className="edit" onClick={()=>setPrint(o)} aria-label={`Print ${invoiceNo(o)}`}><Printer size={15}/></button></div><EmailRecordLink type="receipt" id={o.id} label="Send (demo)"/></div>}/></div><ReceiptDialog receipt={print} onClose={()=>setPrint(null)} reprint/></CommerceWorkspace>;
}
function invoiceNo(o:Order){return `INV-${o.orderNo.replace(/^ORD-?/i,'')}`;}
