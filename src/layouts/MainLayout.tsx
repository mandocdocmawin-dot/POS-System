import {usePageTitle} from '../hooks/usePageTitle';
import { Outlet } from "react-router-dom";
import { IconRail } from "../components/layout/IconRail";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";
import { Footer } from "../components/layout/Footer";
import { MobileNavigation } from "../components/layout/MobileNavigation";
import { useUiStore } from "../store/useUiStore";
export function MainLayout() {
 usePageTitle();
  const { sidebarOpen, mobileOpen, compact } = useUiStore();
  return (
    <div className="flex min-h-dvh">
      <div className="sticky top-0 hidden h-dvh lg:block">
        <IconRail />
      </div>
      {sidebarOpen && (
        <div className="sticky top-0 hidden h-dvh lg:block">
          <Sidebar />
        </div>
      )}
      {mobileOpen && <MobileNavigation />}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className={compact ? "flex-1 p-3" : "flex-1 p-4 md:p-6"}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
