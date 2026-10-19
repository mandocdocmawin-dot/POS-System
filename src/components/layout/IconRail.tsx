import { useTranslation } from '../../i18n/useTranslation';
import {Avatar} from '../common/Avatar';
import {toast,errorMessage} from '../../services/toastService';
import {authService} from '../../services/authService';
import {useCurrentUser} from '../../hooks/useCurrentUser';
import {useAccessibleMenu} from '../../hooks/usePermission';
import { Moon, Sun, LogOut, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { findRoute } from "../../config/menu";
import { useUiStore } from "../../store/useUiStore";
import { useThemeStore } from "../../store/useThemeStore";
import { Brand } from "./Brand";
export function IconRail() {
 const { t } = useTranslation();
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
              title={t(label)}
              aria-label={t(label)}
              key={id}
              to={groups[0].items[0].path}
              className={`icon-btn border-transparent ${section === id ? "menu-active shadow-sm" : ""}`}
            >
              <Icon size={19} />
            </Link>
          ) : (
            <button
              title={t(label)}
              aria-label={t(label)}
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
          aria-label={t(`Switch to ${theme === "light" ? "dark" : "light"} mode`)}
          className="icon-btn border-transparent"
          onClick={toggle}
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <Link
          to="/account/account"
          title="Account settings"
          aria-label={t("Account settings")}
          aria-current={pathname.startsWith('/account/') ? 'page' : undefined}
          className={`icon-btn border-transparent ${pathname.startsWith('/account/') ? 'menu-active' : ''}`}
        >
          <UserRound size={18} />
        </Link>
        <Link
          aria-label={t("Log out (demo)")}
          to="/sign-in"
          onClick={event=>{try{authService.logout();}catch(error){event.preventDefault();toast.error(errorMessage(error));}}}
          className="icon-btn border-transparent"
        >
          <LogOut size={18} />
        </Link>
        <Link
          to="/profile/overview"
          title="Profile overview"
          aria-label="Profile overview"
          aria-current={pathname === '/profile/overview' ? 'page' : undefined}
          className="mx-auto rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
        >
          <Avatar name={user?.name??'Demo user'} imageId={user?.avatarId} size="h-10 w-10"/>
        </Link>
      </div>
    </nav>
  );
}
