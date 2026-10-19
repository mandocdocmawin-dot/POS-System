import { T } from "../../i18n/T";
import {useNavigate,useParams} from 'react-router-dom';
import {StoreProfileDrawer} from '../../components/stores/StoreProfileDrawer';
export function Component(){const {id}=useParams(),navigate=useNavigate();return id?<StoreProfileDrawer id={id} onClose={()=>navigate('/stores')}/>:<p><T text={"Store not found."}/></p>;}
