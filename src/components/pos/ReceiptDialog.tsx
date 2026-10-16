import {receiptService} from '../../services/receiptService';
import {Modal} from '../common/Modal';
import {ReceiptView} from './ReceiptView';
import type {ReceiptDocument} from '../../services/receiptService';
export function ReceiptDialog({receipt,onClose,reprint=false}:{receipt:ReceiptDocument|null;onClose:()=>void;reprint?:boolean}) {
 return <Modal open={!!receipt} title={receipt?.draft?'Draft invoice':reprint?'Order receipt':'Receipt'} onClose={onClose}>{receipt&&<ReceiptView receipt={receipt}/>}<div className="receipt-actions mt-4 flex flex-wrap justify-end gap-2"><button className="btn" onClick={()=>receiptService.print()}>{reprint?'Reprint':'Print'}</button>{!reprint&&!receipt?.draft&&<button className="btn-primary" onClick={onClose}>New Sale</button>}<button className="btn" onClick={onClose}>Close</button></div></Modal>;
}
