import {useParams,useNavigate} from 'react-router-dom';
import {PageActions} from '../../components/common/PageActions';
import {SupplierEditor} from '../../components/suppliers/SupplierEditor';
import {supplierService} from '../../services/supplierService';
export function Component(){const {id}=useParams(),navigate=useNavigate(),supplier=id?supplierService.get(id):undefined;if(id&&!supplier)return <p role="alert">Supplier not found.</p>;return <><PageActions title={id?'Edit Supplier':'Add Supplier'}/><div className="panel max-w-3xl p-5"><SupplierEditor supplier={supplier} onSave={s=>navigate(`/suppliers/${s.id}`)}/></div></>;}
