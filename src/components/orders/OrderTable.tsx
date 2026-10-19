import { T } from "../../i18n/T";
import {useState} from 'react';
import {ProductDetails} from '../../pages/products/ProductDetails';
import {productService} from '../../services/productService';
import {formatDate} from '../../utils/date';
import {Can} from '../auth/Can';
import {Link} from 'react-router-dom';
import {Eye,Undo2,X} from 'lucide-react';
import type {Order} from '../../types/pos';
import {DataTable} from '../common/DataTable';
import {StatusBadge} from '../common/StatusBadge';
import {ProductImage} from '../common/ProductImage';
import {CustomerIdentity} from '../customers/CustomerIdentity';
import {formatPHP} from '../../utils/money';
export function OrderTable({rows,selection,onSelectionChange}:{rows:Order[];selection?:string[];onSelectionChange?:(ids:string[])=>void}){
 const [product,setProduct]=useState('');
 return <><DataTable caption="Orders" rows={rows} rowKey={o=>o.id} searchText={o=>`${o.orderNo} ${o.customerName} ${o.items.map(i=>`${i.name} ${i.sku}`).join(' ')} ${o.coupon?.code??''}`} selection={selection} onSelectionChange={onSelectionChange} columns={[
 {id:'no',header:'Order ID',cell:o=><Link to={`/orders/${o.id}`} className="commerce-muted">{o.orderNo}{o.coupon&&<small className="commerce-subline">Coupon: {o.coupon.code}</small>}</Link>,sortValue:o=>o.orderNo},
 {id:'date',header:'Date',cell:o=>formatDate(new Date(o.createdAt)),sortValue:o=>o.createdAt},
 {id:'product',header:'Product',cell:o=><button className="commerce-product" disabled={!productService.get(o.items[0].productId)} onClick={()=>setProduct(o.items[0].productId)}><ProductImage imageId={o.items[0].imageId} name={o.items[0].name}/><span>{o.items[0].name}{o.items.length>1&&<small className="commerce-subline">+{o.items.length-1}<T text={" more items"}/></small>}</span></button>},
 {id:'customer',header:'Customer',cell:o=><CustomerIdentity id={o.customerId} name={o.customerName}/>},
 {id:'items',header:'Items',cell:o=>o.items.length},
 {id:'total',header:'Total Price',cell:o=><><strong>{formatPHP(o.grandTotal)}</strong><small className="commerce-subline">{[...new Set(o.payments.map(p=>p.method))].join(', ')||'Pay later'}</small></>,sortValue:o=>o.grandTotal},
 {id:'payment',header:'Payment Status',cell:o=><StatusBadge>{o.paymentStatus}</StatusBadge>},
 {id:'quantity',header:'Quantity',cell:o=>o.items.reduce((n,l)=>n+l.quantity,0)},
 {id:'status',header:'Order Status',cell:o=><StatusBadge>{o.orderStatus}</StatusBadge>}
 ]} actions={o=><div className="commerce-actions"><Link to={`/orders/${o.id}`} aria-label={`View ${o.orderNo}`}><Eye size={15}/></Link>{o.orderStatus!=='cancelled'&&o.amountPaid>o.refundedTotal&&<Can permission="orders:refund"><Link className="edit" to={`/orders/${o.id}?action=refund`} aria-label={`Refund ${o.orderNo}`}><Undo2 size={15}/></Link></Can>}{o.orderStatus==='pending'&&!o.refundedTotal&&<Can permission="orders:cancel"><Link className="danger" to={`/orders/${o.id}?action=cancel`} aria-label={`Cancel ${o.orderNo}`}><X size={15}/></Link></Can>}</div>}/>{product&&<ProductDetails id={product} onClose={()=>setProduct('')}/>}</>;
}
