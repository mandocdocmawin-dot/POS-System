import {OfflinePill} from '../pwa/OfflinePill';
import {StoreSummary} from './StoreSummary';
import {ShortcutsDialog} from './ShortcutsDialog';
import {CommandPalette} from '../search/CommandPalette';
import {Can} from '../auth/Can';
import { LanguageFlag } from "./LanguageFlag";
import { AddNewMenu } from "./AddNewMenu";
import { BranchSwitcher } from "./BranchSwitcher";
import {
  Globe,
  PanelLeft,
  ShoppingCart,
  LayoutGrid,
  Check,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguageStore } from '../../store/useLanguageStore';
import { useTranslation } from '../../i18n/useTranslation';

import { useUiStore } from "../../store/useUiStore";
import { Popover } from "../common/Popover";
import { NotificationMenu } from "./NotificationMenu";
import { UserMenu } from "./UserMenu";
import { FullscreenButton } from "./FullscreenButton";
export function Topbar() {

  const ui = useUiStore();

  const { language, setLanguage, error: languageError } = useLanguageStore();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-3 md:px-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <button
          aria-label={t("Toggle sidebar")}
          onClick={() =>
            window.matchMedia("(min-width: 1024px)").matches
              ? ui.toggleSidebar()
              : ui.setMobileOpen(true)
          }
          className="icon-btn"
        >
          <PanelLeft size={18} />
        </button>
        <Link to="/landing" aria-label="Live Preview" title="Live Preview" className="icon-btn border-indigo-800 bg-indigo-900 text-white hover:bg-indigo-800 dark:bg-indigo-800"><Globe size={18}/></Link>
        <Can permission="pos:use"><Link to="/pos" className="btn-primary">
          <ShoppingCart size={16} />
          POS
        </Link></Can>
        <AddNewMenu />
        <BranchSwitcher />
      </div>
      <div className="flex items-center gap-2">
        <OfflinePill/><CommandPalette />
        <button
          className="icon-btn hidden md:flex"
          aria-label={t("Toggle compact layout")}
          aria-pressed={ui.compact}
          onClick={ui.toggleCompact}
        >
          <LayoutGrid size={17} />
        </button>
        <div className="hidden md:block">
          <FullscreenButton />
        </div>
        <Can permission="pos:use"><StoreSummary /></Can><ShortcutsDialog/>
        <NotificationMenu />
        <Popover
          label={t('Select language')}
          trigger={<LanguageFlag language={language === 'en' ? 'English' : 'Filipino'} />}
        >
          <div className="w-36">
            {(['en', 'fil'] as const).map((l) => (
              <button
                className="flex w-full items-center justify-between rounded p-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                key={l}
                aria-pressed={language === l}
                onClick={() => { void setLanguage(l); }}
              >
                {l === 'en' ? 'English' : 'Filipino'}
                {language === l && <Check size={14} />}
              </button>
            ))}
          </div>
        {languageError && <p role="alert" className="p-2 text-xs text-red-500">{t(languageError)}</p>}
        </Popover>
        <UserMenu />
      </div>
    </header>
  );
}
