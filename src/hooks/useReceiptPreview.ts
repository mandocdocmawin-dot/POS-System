import {useEffect,useState} from 'react';
import {imageService} from '../services/imageService';
export function useReceiptPreview(id?:string){const [preview,setPreview]=useState<{id?:string;url:string}>({url:''});useEffect(()=>{let active=true,created='';if(id)void imageService.get(id).then(blob=>{if(blob&&active){created=URL.createObjectURL(blob);setPreview({id,url:created});}}).catch(()=>{if(active)setPreview({id,url:""});});return ()=>{active=false;if(created)URL.revokeObjectURL(created);};},[id]);return preview.id===id?preview.url:'';}

