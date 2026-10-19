import type {Phase8Data} from '../types/phase8';
export function validatePhase8Backup(d:Phase8Data,staffIds:string[],branchIds:string[]){
 const fail=(message:string):never=>{throw new Error(`Invalid backup: ${message}`);};
 const staff=(id:string)=>staffIds.includes(id)||fail('phase 8 staff reference is missing.');
 Object.keys(d.privacyChoices??{}).forEach(staff);
 for(const [owner,targets] of Object.entries(d.follows??{})){staff(owner);targets.forEach(staff);if(targets.includes(owner)||new Set(targets).size!==targets.length)fail('invalid profile follows.');}
 const projects=d.projects??[];if(new Set(projects.map(p=>p.id)).size!==projects.length)fail('duplicate project IDs.');for(const p of projects){staff(p.ownerId);p.memberIds.forEach(staff);}
 for(const rows of [d.events,d.conversations,d.messages,d.emails,d.templates,d.tickets,d.faqs,d.plans,d.invoices,d.documents,d.notes,d.errors])if(new Set(rows.map(r=>r.id)).size!==rows.length)fail('duplicate phase 8 record IDs.');
 for(const event of d.events){staff(event.createdBy);event.attendeeStaffIds.forEach(staff);if(event.branchId&&!branchIds.includes(event.branchId))fail('event branch is missing.');if(event.allDay?event.end.slice(0,10)<event.start.slice(0,10):event.end<=event.start)fail('event end must follow start.');}
 const groupNames=new Set<string>();for(const c of d.conversations){staff(c.createdBy);c.memberIds.forEach(staff);if(new Set(c.memberIds).size!==c.memberIds.length||c.memberIds.length<2)fail('invalid conversation members.');if(c.type==='direct'&&c.memberIds.length!==2)fail('direct chat needs two members.');if(c.type==='group'){const name=c.name?.trim().toLowerCase()??'';if(!name||groupNames.has(name))fail('group names must be unique.');groupNames.add(name);}}
 for(const m of d.messages){staff(m.senderId);const c=d.conversations.find(c=>c.id===m.conversationId);if(!c)fail('message conversation is missing.');Object.keys(m.readBy).forEach(staff);if(m.replyToId&&!d.messages.some(r=>r.id===m.replyToId&&r.conversationId===m.conversationId))fail('message reply target is missing.');}
 for(const e of d.emails){staff(e.ownerStaffId);if(e.templateId&&!d.templates.some(t=>t.id===e.templateId))fail('email template is missing.');}
 for(const t of d.tickets){staff(t.authorId);if(t.assigneeId)staff(t.assigneeId);t.replies.forEach(r=>staff(r.authorId));const match=/^TKT-(\d{4})-(\d+)$/.exec(t.ticketNo);if(!match||Number(match[2])>(d.ticketCounters[match[1]]??0))fail('ticket counter is behind ticket numbers.');}
 if(new Set(d.tickets.map(t=>t.ticketNo)).size!==d.tickets.length)fail('duplicate ticket numbers.');
 if(d.subscription&&!d.plans.some(p=>p.id===d.subscription?.planId))fail('subscription plan is missing.');
 for(const invoice of d.invoices)if(!d.plans.some(p=>p.id===invoice.planId))fail('billing plan is missing.');
 for(const doc of d.documents){staff(doc.staffId);staff(doc.uploadedBy);if(doc.size>5*1024*1024)fail('document metadata exceeds file limit.');}
 for(const staffId of staffIds)if(d.documents.filter(doc=>doc.staffId===staffId).reduce((sum,doc)=>sum+doc.size,0)>50*1024*1024)fail('document metadata exceeds staff limit.');
 for(const n of d.notes){staff(n.profileStaffId);staff(n.authorId);}
 for(const p of d.prefs)staff(p.userId);for(const n of d.notificationStates)staff(n.userId);for(const id of [...Object.keys(d.layers),...Object.keys(d.recentSearches)])staff(id);
}
