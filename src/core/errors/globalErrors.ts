import { errorLogService } from '../../services/errorLogService';
import { toast } from '../../services/toastService';
let handling=false;
export function installGlobalErrorHandlers() {
  const report=(error:unknown)=>{if(handling)return;handling=true;try{errorLogService.record(error);toast.error('An error occurred. Details are saved locally in Settings → Data.');}finally{handling=false;}};
  const onError=(event:ErrorEvent)=>report(event.error??event.message),onRejection=(event:PromiseRejectionEvent)=>report(event.reason);
  window.addEventListener('error',onError);window.addEventListener('unhandledrejection',onRejection);
  return ()=>{window.removeEventListener('error',onError);window.removeEventListener('unhandledrejection',onRejection);};
}
