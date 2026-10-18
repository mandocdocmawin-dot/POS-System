import {useEffect,useState} from 'react';
import {imageService} from '../../services/imageService';
import maria from '../../assets/landing/avatar-maria.jpg';
import carlo from '../../assets/landing/avatar-carlo.jpg';
import ana from '../../assets/landing/avatar-ana.jpg';
import liza from '../../assets/landing/avatar-liza.jpg';
import person8 from '../../assets/avatars/person-8.jpg';
import person11 from '../../assets/avatars/person-11.jpg';
import person13 from '../../assets/avatars/person-13.jpg';
import person15 from '../../assets/avatars/person-15.jpg';
const portraits=[maria,carlo,ana,liza,person8,person11,person13,person15];
export function Avatar({name,size='h-8 w-8',imageId}:{name:string;size?:string;index?:number;imageId?:string}) {
 const [photo,setPhoto]=useState<{id:string;url:string}>();
 useEffect(()=>{let live=true,url='';if(imageId)void imageService.get(imageId).then(blob=>{if(live&&blob){url=URL.createObjectURL(blob);setPhoto({id:imageId,url});}}).catch(()=>{/* Fall back to a local demo portrait. */});return()=>{live=false;if(url)URL.revokeObjectURL(url);};},[imageId]);
 const hash=Array.from(name.toLowerCase()).reduce((value,char)=>(value*31+char.charCodeAt(0))>>>0,0);
 const source=photo?.id===imageId?photo?.url:undefined;
 return <img src={source??portraits[hash%portraits.length]} alt={name} title={source?name:`${name} · sample portrait`} width={48} height={48} loading="lazy" decoding="async" className={`inline-block shrink-0 rounded-full border-2 border-white object-cover dark:border-slate-900 ${size}`}/>;
}
