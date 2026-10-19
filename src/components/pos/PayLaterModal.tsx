import { T } from "../../i18n/T";
import {PaymentModal} from './PaymentModal';
import {Modal} from '../common/Modal';
import {customerService} from '../../services/customerService';
import {posService} from '../../services/posService';
import type {Order,Payment} from '../../types/pos';
export function PayLaterModal({onClose,onComplete,onSelectCustomer}:{onClose:()=>void;onComplete:(order:Order)=>void;onSelectCustomer:()=>void}) {
 const customer=customerService.get(posService.state().customerId);
 if(!customer||customer.isWalkIn)return <Modal open title="Choose a customer for Pay Later" onClose={onClose}><p className="mb-5">Pay Later requires a named customer so the unpaid balance can be recorded.</p><button className="btn-primary" onClick={onSelectCustomer}><T text={"Select or create customer"}/></button></Modal>;
 const complete=(payments:Payment[],dueDate?:string)=>onComplete(posService.complete(payments,{payLater:true,dueDate}));
 return <PaymentModal payLater onClose={onClose} onComplete={complete}/>;
}
