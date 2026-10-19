import { T } from "../../i18n/T";
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
export function InstallButton(){const {available,install,message}=useInstallPrompt();return <>{available&&<button className="btn" onClick={()=>void install()}><T text={"Install app"}/></button>}{message&&<p className="text-xs">{message}</p>}</>;}
