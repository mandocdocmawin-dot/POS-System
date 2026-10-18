import {useState} from 'react';
import {Download,Printer,Mail,CreditCard} from 'lucide-react';
import {receiptService,type ReceiptDocument} from '../../services/receiptService';
import {Modal} from '../common/Modal';
import {ReceiptView} from './ReceiptView';
import {InvoicePreview} from './InvoicePreview';
import {Composer} from '../email/Composer';
import {Can} from '../auth/Can';
import {formatPHP} from '../../utils/money';
export function ReceiptDialog({receipt,...props}:{receipt:ReceiptDocument|null;onClose:()=>void;reprint?:boolean;onPayment?:()=>void}) {
 return receipt?<ReceiptPreview receipt={receipt} {...props}/>:null;
}
function ReceiptPreview({receipt,onClose,reprint=false,onPayment}:{receipt:ReceiptDocument;onClose:()=>void;reprint?:boolean;onPayment?:()=>void}){
 const [email,setEmail]=useState(false);
 return <><Modal open title={receipt.draft?'Invoice Preview':reprint?'Order receipt':'Receipt'} size={receipt.draft?'wide':'default'} onClose={onClose}>
  {receipt.draft?<><div className="receipt-actions mb-4 flex flex-wrap items-center gap-2"><button className="btn" onClick={()=>receiptService.print()}><Printer size={15}/>Print / Save PDF</button><Can permission="email:use"><button className="btn" onClick={()=>setEmail(true)}><Mail size={15}/>Email (demo)</button></Can>{onPayment&&<button className="btn" onClick={onPayment}><CreditCard size={15}/>Payment</button>}<button className="btn-primary sm:ml-auto" title="Download the invoice as an HTML document" onClick={()=>receiptService.download(receipt)}><Download size={15}/>Save Invoice</button></div><InvoicePreview receipt={receipt}/></>:<ReceiptView receipt={receipt}/>}
  <div className="receipt-actions mt-4 flex flex-wrap items-center justify-end gap-2"><p className="mr-auto text-xs text-slate-500">Downloads save as HTML. Use Print / Save PDF for PDF.</p>{!receipt.draft&&<><button className="btn" onClick={()=>receiptService.download(receipt)}><Download size={15}/>Download</button><button className="btn" onClick={()=>receiptService.print()}><Printer size={15}/>{reprint?'Reprint':'Print Receipt'}</button></>}{!reprint&&!receipt.draft&&<button className="btn-primary" onClick={onClose}>New Sale</button>}<button className="btn" onClick={onClose}>Close</button></div>
 </Modal>{email&&<Composer initial={{to:[],subject:`Invoice ${receipt.orderNo??'draft'} — ${receipt.receiptSnapshot?.general.businessName??'TindaPOS'}`,body:`Hello ${receipt.customerName},\n\nInvoice total: ${formatPHP(receipt.grandTotal)}\n${receipt.draft?'Draft preview — no sale recorded.':`Order: ${receipt.orderNo}`}\n\nThis message is a local demo. Download the invoice separately if needed.`}} close={()=>setEmail(false)}/>}</>;
}
