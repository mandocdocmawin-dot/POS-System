import {useNavigate,useParams} from 'react-router-dom';
import {StoreProfileDrawer} from '../../components/stores/StoreProfileDrawer';
export function Component(){const {id}=useParams(),navigate=useNavigate();return id?<StoreProfileDrawer id={id} onClose={()=>navigate('/stores')}/>:<p>Store not found.</p>;}
