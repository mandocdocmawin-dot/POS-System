import {Link} from 'react-router-dom';
import {Avatar} from '../common/Avatar';
import {customerService} from '../../services/customerService';

export function CustomerIdentity({id,name,email=true}:{id:string;name?:string;email?:boolean}) {
 const customer=customerService.get(id),label=customer?.name??name??'Unknown customer';
 return <Link to={`/customers/${id}`} className="customer-identity"><Avatar name={label} size="h-10 w-10"/><span><strong>{label}</strong>{email&&customer?.email&&<small>{customer.email}</small>}</span></Link>;
}
