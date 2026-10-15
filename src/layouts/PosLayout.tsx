import { Outlet } from "react-router-dom";
import { PosTopbar } from "../pages/pos/PosTopbar";
export function PosLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <PosTopbar />
      <Outlet />
    </div>
  );
}
