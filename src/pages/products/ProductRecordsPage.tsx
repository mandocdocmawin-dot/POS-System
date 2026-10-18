import {useState} from 'react';
import {useLocation} from 'react-router-dom';
import {Eye,Pencil,Trash2,Plus,Star} from 'lucide-react';
import {ProductWorkspace,CatalogStatus} from '../../components/products/ProductWorkspace';
import {DataTable} from '../../components/common/DataTable';
import {ProductImage} from '../../components/common/ProductImage';
import {Avatar} from '../../components/common/Avatar';
import {Modal} from '../../components/common/Modal';
import {Select,TextInput,Textarea} from '../../components/forms/Fields';
import {Can} from '../../components/auth/Can';
import {productService} from '../../services/productService';
import {useLocalData} from '../../services/useLocalData';
import {localDay} from '../../utils/calendar';
type RecordRow={id:string;productId:string;customer:string;rating:number;text:string;status:string;type:string;purchase:string;start:string;end:string};
const names=['Ana Santos','Marco Reyes','Liza Cruz','Jose Garcia','Maria Mendoza','Carlo Ramos','Elena Torres'];
const comments=['Easy to find and ready for pickup. Packaging was in good condition.','The order was complete. Helpful staff at the counter.','Good value for our weekly grocery run.','The product matched what I ordered.','Convenient to buy our household essentials here.','Fresh stock and a quick checkout.','I would buy this again on my next visit.'];
function seed():RecordRow[]{return productService.list().slice(0,7).map((p,i)=>({id:`sample-${i}`,productId:p.id,customer:names[i],rating:5-i%3,text:comments[i],status:['Published','Hidden','Pending'][i%3],type:['Manufacturer','Store','Extended'][i%3],purchase:'2026-01-15',start:'2026-01-15',end:i%3===1?'2026-06-15':'2027-01-15'}));}
export function Component(){const {pathname}=useLocation();return <Records key={pathname} warranty={pathname.endsWith('/warranty')}/>;}
function Records({warranty}:{warranty:boolean}){
 useLocalData();
 const products=productService.list();
 const [records,setRecords]=useState(seed);
 const [status,setStatus]=useState(''),[rating,setRating]=useState(''),[type,setType]=useState(''),[date,setDate]=useState('');
 const [selection,setSelection]=useState<string[]>([]),[editing,setEditing]=useState<RecordRow>(),[view,setView]=useState<RecordRow>();
 const title=warranty?'Warranties':'Reviews';
 const state=(r:RecordRow)=>warranty?(r.end<localDay(new Date())?'Expired':'Active'):r.status;
 const rows=records.filter(r=>(!status||state(r)===status)&&(!rating||r.rating===Number(rating))&&(!type||r.type===type)&&(!date||r.purchase===date));
 const product=(r:RecordRow)=>products.find(p=>p.id===r.productId);
 const productCell=(r:RecordRow)=>{const p=product(r);return <div className="flex items-center gap-3"><ProductImage name={p?.name??'Product unavailable'} imageId={p?.imageId}/><div className="font-semibold">{p?.name??'Product unavailable'}<p className="mt-1 text-xs font-normal text-slate-500">SKU: {p?.sku??'—'}</p></div></div>;};
 const create=()=>setEditing({id:crypto.randomUUID(),productId:products[0]?.id??'',customer:'',rating:5,text:'',status:'Pending',type:'Store',purchase:localDay(new Date()),start:localDay(new Date()),end:localDay(new Date())});
 return <ProductWorkspace title={title}>
  <p className="product-sample-note">Design demo · sample {title.toLowerCase()} using your catalog images. Changes stay on this page; these are not verified purchases or warranty coverage.</p>
  <section className="product-panel">
   {warranty?<div className="product-panel-heading"><h2>Warranty List</h2><Can permission="products:create"><button className="btn-primary" onClick={create} disabled={!products.length}><Plus size={16}/> Add Warranty</button></Can></div>:<div className="product-table-tabs">{['','Published','Hidden','Pending'].map(s=><button key={s} aria-pressed={status===s} onClick={()=>setStatus(s)}>{s||'All Reviews'}</button>)}</div>}
   <div className="product-filters border-0">
    <Select label="Status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option>{(warranty?['Active','Expired']:['Published','Hidden','Pending']).map(s=><option key={s}>{s}</option>)}</Select>
    {warranty?<Select label="Warranty type" value={type} onChange={e=>setType(e.target.value)}><option value="">All warranties</option>{['Manufacturer','Store','Extended'].map(t=><option key={t}>{t}</option>)}</Select>:<Select label="Rating" value={rating} onChange={e=>setRating(e.target.value)}><option value="">All ratings</option>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</Select>}
    <TextInput label={warranty?'Purchase date':'Review date'} type="date" value={date} onChange={e=>setDate(e.target.value)}/>
    {!warranty&&<Can permission="products:create"><button className="btn-primary self-end" onClick={create} disabled={!products.length}><Plus size={16}/> Add Review</button></Can>}
   </div>
   <DataTable caption={title} rows={rows} rowKey={r=>r.id} selection={selection} onSelectionChange={setSelection} searchText={r=>`${r.customer} ${product(r)?.name??''} ${product(r)?.sku??''} ${r.text}`} columns={warranty?[
    {id:'product',header:'Product',cell:productCell,sortValue:r=>product(r)?.name??''},
    {id:'customer',header:'Customer',cell:r=>r.customer,sortValue:r=>r.customer},
    {id:'type',header:'Warranty Type',cell:r=><span className="rounded border border-slate-200 px-2 py-1 text-xs dark:border-slate-700">{r.type}</span>,sortValue:r=>r.type},
    {id:'purchase',header:'Purchase Date',cell:r=>r.purchase,sortValue:r=>r.purchase},
    {id:'status',header:'Status',cell:r=><CatalogStatus status={state(r)}/>,sortValue:state},
    {id:'start',header:'Warranty Start',cell:r=>r.start,sortValue:r=>r.start},
    {id:'end',header:'Warranty End',cell:r=>r.end,sortValue:r=>r.end},
   ]:[
    {id:'customer',header:'Customer',cell:r=><div className="flex items-center gap-3"><Avatar name={r.customer} size="h-10 w-10"/><div className="font-semibold">{r.customer}<p className="mt-1 text-xs font-normal text-slate-500">{r.purchase} · sample</p></div></div>,sortValue:r=>r.customer},
    {id:'review',header:'Review',cell:r=><div className="max-w-lg whitespace-normal"><div className="mb-2 flex text-amber-400" aria-label={`${r.rating} out of 5 stars`}>{[1,2,3,4,5].map(n=><Star key={n} size={15} fill={n<=r.rating?'currentColor':'none'}/>)}</div><p className="min-w-60 leading-relaxed">{r.text}</p></div>},
    {id:'status',header:'Status',cell:r=><CatalogStatus status={r.status}/>,sortValue:r=>r.status},
    {id:'product',header:'Product',cell:productCell,sortValue:r=>product(r)?.name??''},
   ]} actions={r=><div className="flex gap-2">{warranty&&<button className="icon-btn border-0 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15" aria-label={`View warranty for ${r.customer}`} onClick={()=>setView(r)}><Eye size={15}/></button>}<Can permission="products:edit"><button className="icon-btn border-0 bg-slate-100 dark:bg-slate-800" aria-label={`Edit ${r.customer}`} onClick={()=>setEditing(r)}><Pencil size={15}/></button><button className="icon-btn border-0 bg-rose-50 text-rose-500 dark:bg-rose-500/10" aria-label={`Remove sample for ${r.customer}`} onClick={()=>{setRecords(prev=>prev.filter(x=>x.id!==r.id));setSelection(prev=>prev.filter(id=>id!==r.id));}}><Trash2 size={15}/></button></Can></div>}/>
  </section>
  <Modal open={!!view} onClose={()=>setView(undefined)} title="Sample warranty details">{view&&<div className="space-y-4">{productCell(view)}<p>{view.customer} · {view.type}</p><p>{view.start} – {view.end}</p><CatalogStatus status={state(view)}/><p className="text-xs text-slate-500">Layout sample only. This does not establish coverage for this product.</p></div>}</Modal>
  <Modal open={!!editing} onClose={()=>setEditing(undefined)} title={`${records.some(r=>r.id===editing?.id)?'Edit':'Add'} ${warranty?'sample warranty':'sample review'}`}>
   {editing&&<form className="space-y-4" onSubmit={e=>{e.preventDefault();setRecords(prev=>prev.some(r=>r.id===editing.id)?prev.map(r=>r.id===editing.id?editing:r):[editing,...prev]);setEditing(undefined);}}>
    <Select label="Product" required value={editing.productId} onChange={e=>setEditing({...editing,productId:e.target.value})}>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</Select>
    <TextInput label="Customer name" required maxLength={80} value={editing.customer} onChange={e=>setEditing({...editing,customer:e.target.value})}/>
    {warranty?<><Select label="Warranty type" value={editing.type} onChange={e=>setEditing({...editing,type:e.target.value})}>{['Store','Manufacturer','Extended'].map(t=><option key={t}>{t}</option>)}</Select><TextInput label="Purchase date" type="date" required value={editing.purchase} onChange={e=>setEditing({...editing,purchase:e.target.value})}/><div className="grid gap-4 sm:grid-cols-2"><TextInput label="Warranty start" type="date" required value={editing.start} onChange={e=>setEditing({...editing,start:e.target.value})}/><TextInput label="Warranty end" type="date" required min={editing.start} value={editing.end} onChange={e=>setEditing({...editing,end:e.target.value})}/></div></>:<><Select label="Rating" value={editing.rating} onChange={e=>setEditing({...editing,rating:Number(e.target.value)})}>{[5,4,3,2,1].map(n=><option key={n} value={n}>{n} stars</option>)}</Select><Textarea label="Review" required maxLength={1000} rows={4} value={editing.text} onChange={e=>setEditing({...editing,text:e.target.value})}/><Select label="Visibility" value={editing.status} onChange={e=>setEditing({...editing,status:e.target.value})}>{['Published','Hidden','Pending'].map(s=><option key={s}>{s}</option>)}</Select></>}
    <p className="text-xs text-slate-500">Demo changes last while this page is open.</p><div className="flex justify-end gap-2"><button type="button" className="btn" onClick={()=>setEditing(undefined)}>Cancel</button><button className="btn-primary">Save sample</button></div>
   </form>}
  </Modal>
 </ProductWorkspace>;
}
