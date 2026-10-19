import { useTranslation } from '../i18n/useTranslation';
import {guideService} from '../services/guideService';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { findRoute } from '../config/menu';
export function usePageTitle(title?: string) {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  useEffect(()=>{guideService.visit(pathname);},[pathname]);
  useEffect(() => { document.title = `${t(title ?? findRoute(pathname)?.title ?? pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') ?? 'Dashboard')} · TindaPOS`; }, [title, pathname, t]);
}
