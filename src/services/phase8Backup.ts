import {version} from '../../package.json';
import {useCalendarStore} from '../store/useCalendarStore';
import {useNotificationStore} from '../store/useNotificationStore';
import {useChatStore} from '../store/useChatStore';
import {useEmailStore} from '../store/useEmailStore';
import {useTicketStore} from '../store/useTicketStore';
import {useContentStore} from '../store/useContentStore';
import {useDocumentStore} from '../store/useDocumentStore';
import {useNoteStore} from '../store/useNoteStore';
import {useGuideStore} from '../store/useGuideStore';
import {useErrorLogStore} from '../store/useErrorLogStore';
import {useMetaStore} from '../store/useMetaStore';
import type {Phase8Data} from '../types/phase8';
export const emptyPhase8=():Phase8Data=>({events:[],layers:{},notificationStates:[],prefs:[],conversations:[],messages:[],emails:[],templates:[],tickets:[],ticketCounters:{},faqs:[],plans:[],subscription:null,invoices:[],documents:[],notes:[],votes:{},recentSearches:{},guide:{startedAt:'',dismissed:false,collapsed:false},errors:[]});
export function snapshotPhase8():Phase8Data{return structuredClone({...useCalendarStore.getState(),...useNotificationStore.getState(),...useChatStore.getState(),...useEmailStore.getState(),...useTicketStore.getState(),...useContentStore.getState(),...useDocumentStore.getState(),...useNoteStore.getState(),...useErrorLogStore.getState(),guide:useGuideStore.getState(),meta:useMetaStore.getState()});}
export function replacePhase8(d:Phase8Data){
useCalendarStore.setState({events:d.events,layers:d.layers},true);
useNotificationStore.setState({notificationStates:d.notificationStates,prefs:d.prefs},true);
useChatStore.setState({conversations:d.conversations,messages:d.messages},true);
useEmailStore.setState({emails:d.emails,templates:d.templates},true);
useTicketStore.setState({tickets:d.tickets,ticketCounters:d.ticketCounters},true);
useContentStore.setState({faqs:d.faqs,plans:d.plans,subscription:d.subscription,invoices:d.invoices,votes:d.votes,recentSearches:d.recentSearches},true);
useDocumentStore.setState({documents:d.documents},true);useNoteStore.setState({notes:d.notes},true);useGuideStore.setState(d.guide,true);useErrorLogStore.setState({errors:d.errors},true);
if(d.meta)useMetaStore.setState({...d.meta,appVersion:version,schemaVersion:8},true);else useMetaStore.setState({lastBackupAt:undefined});
}
