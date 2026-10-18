import { useEffect, useState } from 'react';
import { imageService } from '../../services/imageService';
import { Modal } from '../common/Modal';
export function useReceiptPreview(id?:string){const [url,setUrl]=useState('');useEffect(()=>{let active=true,created='';setUrl('');if(id)void imageService.get(id).then(blob=>{if(blob&&active){created=URL.createObjectURL(blob);setUrl(created);}});return ()=>{active=false;if(created)URL.revokeObjectURL(created);};},[id]);return url;}
export function ReceiptAttachment({id}:{id:string}){const [open,setOpen]=useState(false),url=useReceiptPreview(id);return <><button className="btn" onClick={()=>setOpen(true)}>Receipt</button><Modal open={open} title="Receipt attachment" onClose={()=>setOpen(false)}>{url?<img className="mx-auto max-h-[65vh] max-w-full object-contain" src={url} alt="Saved receipt"/>:<p>Receipt image is unavailable.</p>}</Modal></>;}
