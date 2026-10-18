import {z} from 'zod';
import {settingsService} from './settingsService';
import {ticketService} from './ticketService';
import { authService } from './authService';
import { planService } from './planService';
import { faqService } from './faqService';
export const landingService = {
  contactInfo:()=>{const u=authService.getCurrentUser();return {name:u?.name??'',email:u?.email??'',signedIn:!!u,business:{...settingsService.get().general,email:'mandocdocmawin@gmail.com'}};},
  sendInquiry:(input:{name:string;email:string;phone:string;message:string})=>{const data=z.object({name:z.string().trim().min(1).max(120),email:z.email(),phone:z.string().max(40),message:z.string().trim().min(1).max(5000)}).parse(input);return ticketService.create({subject:'Landing page inquiry from '+data.name,message:'From: '+data.name+'\nEmail: '+data.email+'\nPhone: '+(data.phone||'Not provided')+'\n\n'+data.message,category:'Getting Started',priority:'normal',source:'contact'});},
  plans: () => planService.list(true),
  faqs: () => faqService.list(true).slice(0, 5),
  tryRole: (role: string) => { authService.loginDemo(role); return authService.firstPath(); },
};
