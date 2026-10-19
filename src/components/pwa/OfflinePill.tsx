import { T } from "../../i18n/T";
import {useOnlineStatus} from '../../hooks/useOnlineStatus';
export function OfflinePill(){return useOnlineStatus()?null:<span role="status" className="rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-950 dark:bg-amber-900 dark:text-amber-100"><T text={"Offline · everything still works"}/></span>;}
