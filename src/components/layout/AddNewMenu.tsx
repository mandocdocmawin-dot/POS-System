import { T } from "../../i18n/T";
import {usePermission} from '../../hooks/usePermission';
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { quickActions } from "../../config/quickActions";
import { Popover } from "../common/Popover";
export function AddNewMenu() {
 const {canPath}=usePermission();
  return (
    <Popover
      label="Add new"
      align="left"
      className="btn"
      trigger={
        <><T text={"Add New"}/><Plus size={15} />
        </>
      }
    >
      <div className="grid w-[560px] max-w-[calc(100vw-2rem)] grid-cols-2 gap-1 p-2 sm:grid-cols-3">
        {quickActions.filter(a=>canPath(a.path)).map(({ label, path, icon: Icon }) => (
          <Link
            key={label}
            to={path}
            className="flex items-center gap-2.5 rounded-lg p-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 dark:border-slate-700">
              <Icon size={18} />
            </span>
            <T>{label}</T>
          </Link>
        ))}
      </div>
    </Popover>
  );
}
