import { useState } from 'react';
import {useReceiptPreview} from '../../hooks/useReceiptPreview';
import { Modal } from '../common/Modal';
export function ReceiptAttachment({id}:{id:string}){const [open,setOpen]=useState(false),url=useReceiptPreview(id);return <><button className="btn" onClick={()=>setOpen(true)}>Receipt</button><Modal open={open} title="Receipt attachment" onClose={()=>setOpen(false)}>{url?<img className="mx-auto max-h-[65vh] max-w-full object-contain" src={url} alt="Saved receipt"/>:<p>Receipt image is unavailable.</p>}</Modal></>;}

