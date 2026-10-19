import {Link} from 'react-router-dom';
import {Avatar} from '../common/Avatar';
import {supplierService} from '../../services/supplierService';

export function SupplierIdentity({id,email=false}:{id:string;email?:boolean}) {
 const supplier=supplierService.get(id);
 return <Link to={`/suppliers/${id}`} className="customer-identity supplier-identity"><Avatar name={supplier?.name??'Supplier'} size="h-9 w-9"/><span><strong>{supplier?.name??'Unknown supplier'}</strong>{email&&supplier?.email&&<small>{supplier.email}</small>}</span></Link>;
}
