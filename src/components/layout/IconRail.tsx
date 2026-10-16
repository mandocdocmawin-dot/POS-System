import {authService} from '../../services/authService';
import {useCurrentUser} from '../../hooks/useCurrentUser';
import {useAccessibleMenu} from '../../hooks/usePermission';
import { Moon, Sun, UserRound, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { findRoute } from "../../config/menu";
import { useUiStore } from "../../store/useUiStore";
import { useThemeStore } from "../../store/useThemeStore";
import { Brand } from "./Brand";
export function IconRail() {
 const menu=useAccessibleMenu();
 const user=useCurrentUser();
  const { section, setSection } = useUiStore();
  const { pathname } = useLocation();
  const { theme, toggle } = useThemeStore();
  useEffect(() => {
    const route = findRoute(pathname);
    if (route) setSection(route.sectionId);
  }, [pathname, setSection]);
  return (
    <nav
      aria-label="Application sections"
      className="flex h-dvh w-16 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <Brand compact />
      <div className="mt-7 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2">
        {menu.map(({ id, label, railIcon: Icon, groups }) =>
          ["support", "licenses", "activity-history"].includes(id) ? (
            <Link
              title={label}
              aria-label={label}
              key={id}
              to={groups[0].items[0].path}
              className={`icon-btn border-transparent ${section === id ? "menu-active shadow-sm" : ""}`}
            >
              <Icon size={19} />
            </Link>
          ) : (
            <button
              title={label}
              aria-label={label}
              aria-pressed={section === id}
              key={id}
              onClick={() => setSection(id)}
              className={`icon-btn border-transparent ${section === id ? "menu-active shadow-sm" : ""}`}
            >
              <Icon size={19} />
            </button>
          ),
        )}
      </div>
      <div className="flex flex-col gap-2 pt-3">
        <button
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          className="icon-btn border-transparent"
          onClick={toggle}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <Link
          aria-label="Profile"
          to="/profile/overview"
          className="icon-btn border-transparent"
        >
          <UserRound size={18} />
        </Link>
        <Link
          aria-label="Log out (demo)"
          to="/sign-in"
          onClick={()=>authService.logout()}
          className="icon-btn border-transparent"
        >
          <LogOut size={18} />
        </Link>
        <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">
          {user?.name.split(" ").slice(0,2).map(n=>n[0]).join("")}
        </span>
      </div>
    </nav>
  );
}
