import { T } from "../../i18n/T";
import {useParams,useNavigate} from 'react-router-dom';
import {CommerceWorkspace} from '../../components/customers/CommerceWorkspace';
import {Avatar} from '../../components/common/Avatar';
import {Link} from 'react-router-dom';
import {SupplierEditor} from '../../components/suppliers/SupplierEditor';
import {supplierService} from '../../services/supplierService';
export function Component(){const {id}=useParams(),navigate=useNavigate(),supplier=id?supplierService.get(id):undefined;if(id&&!supplier)return <p role="alert"><T text={"Supplier not found."}/></p>;return <CommerceWorkspace title={id?'Edit Supplier':'Add Supplier'} section="Suppliers"><div className="mb-4"><Link className="btn" to="/suppliers/supplier-list">← Suppliers List</Link></div><div className="panel max-w-3xl p-5"><div className="mb-5 flex items-center gap-4 border-b border-slate-100 pb-5"><Avatar name={supplier?.name??'New supplier'} size="h-16 w-16"/><div><h2 className="font-semibold"><T text={"Supplier information"}/></h2><p className="commerce-muted text-xs mt-1"><T text={"Contact details and company information"}/></p></div></div><SupplierEditor supplier={supplier} onSave={s=>navigate(`/suppliers/${s.id}`)}/></div></CommerceWorkspace>;}
