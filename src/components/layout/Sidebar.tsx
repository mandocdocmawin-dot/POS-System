import { T } from "../../i18n/T";
import {useClock} from '../../hooks/useClock';
import {useAccessibleMenu} from '../../hooks/usePermission';
import {useLocalData} from '../../services/useLocalData';
import {navigationService} from '../../services/navigationService';
import { ChevronDown, ChevronUp, Store, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { resolveMenuPath } from "../../config/menu";
import { useUiStore } from "../../store/useUiStore";
import { Brand } from "./Brand";
export function Sidebar() {
 const menu=useAccessibleMenu();
 const now=useClock(60000);
  useLocalData();
  const section = useUiStore((s) => s.section);
  const close = useUiStore((s) => s.setMobileOpen);
  const { pathname } = useLocation();
  const canonicalPath = resolveMenuPath(pathname);
  const current = menu.find((s) => s.id === section) ?? menu[0];
  const activeParent = current?.groups
    .flatMap((g) => g.items)
    .find((i) => i.children?.some((c) => c.path === canonicalPath))?.label;
  const [expanded, setExpanded] = useState<{
    route: string;
    section: string;
    label: string;
  } | null>(null);
  const open =
    expanded?.route === pathname && expanded.section === section
      ? expanded.label
      : activeParent;
  return (
    <aside
      aria-label="Section navigation"
      className="flex h-dvh w-60 shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex h-16 shrink-0 items-center border-b border-slate-100 px-5 dark:border-slate-800">
        <Brand />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {current?.groups.map((group, index) => (
          <div key={index} className="mb-6">
            {group.label && (
              <p className="mb-3 px-3 text-sm font-semibold tracking-[0.14em] text-slate-400">
                <T>{group.label}</T>
              </p>
            )}
            {group.items.map(({ label, icon: Icon, path, children }) => (
              <div key={label} className="mb-1">
                {children ? (
                  <>
                    <button
                      aria-expanded={open === label}
                      aria-controls={`menu-${label}`}
                      onClick={() =>
                        setExpanded({
                          route: pathname,
                          section,
                          label: open === label ? "" : label,
                        })
                      }
                      className={`flex h-10 w-full items-center gap-3 rounded-lg border px-3 text-sm ${open === label ? "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white" : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                    >
                      <Icon size={17} className="shrink-0" aria-hidden="true" />
                      <span className="flex-1 text-left"><T>{label}</T></span>{navigationService.badge(path,now)>0&&<span aria-label={`${navigationService.badge(path,now)} requiring attention`} className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-200">{navigationService.badge(path,now)}</span>}
                      {open === label ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </button>
                    {open === label && (
                      <div
                        id={`menu-${label}`}
                        className="ml-5 border-l border-slate-200 py-1 dark:border-slate-700"
                      >
                        {children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => close(false)}
                            className={({ isActive }) =>
                              `flex min-h-9 items-center gap-3 pl-5 text-sm ${isActive || child.path === canonicalPath ? "font-medium text-indigo-600 dark:text-indigo-300" : "text-slate-500 hover:text-indigo-600"}`
                            }
                          >
                            <child.icon size={16} className="shrink-0" aria-hidden="true" />
                            <T>{child.label}</T>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <NavLink
                    end
                    to={path}
                    onClick={() => close(false)}
                    className={({ isActive }) =>
                      `flex h-10 items-center gap-3 rounded-lg px-3 text-sm ${isActive ? "menu-active font-semibold" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`
                    }
                  >
                    <Icon size={17} />
                    <T>{label}</T>
                  </NavLink>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>
      {menu.some(s=>s.groups.some(g=>g.items.some(i=>i.path.startsWith("/reports"))))&&<div className="m-3 shrink-0 rounded-xl border border-indigo-100 bg-gradient-to-br from-orange-50 to-indigo-50 p-4 dark:border-indigo-900 dark:from-slate-800 dark:to-indigo-950">
        <Store size={24} className="mb-3 text-indigo-500" />
        <p className="text-sm text-slate-500"><T text={"Live sales insights"}/></p>
        <h3 className="mb-3 mt-1 text-sm font-semibold"><T text={"Boost today's sales"}/></h3>
        <Link
          className="btn-primary w-full"
          to="/reports/sales"
          onClick={() => close(false)}
        ><T text={"View Sales"}/><ArrowUpRight size={14} />
        </Link>
      </div>}
    </aside>
  );
}
