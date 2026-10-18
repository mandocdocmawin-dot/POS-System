import {usePageTitle} from '../hooks/usePageTitle';
import { Outlet } from "react-router-dom";
import { PosTopbar } from "../pages/pos/PosTopbar";
export function PosLayout() {
 usePageTitle();
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <PosTopbar />
      <Outlet />
    </div>
  );
}
