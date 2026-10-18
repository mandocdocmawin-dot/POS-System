import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { findRoute } from '../config/menu';
export function usePageTitle(title?: string) {
  const { pathname } = useLocation();
  useEffect(() => { document.title = `${title ?? findRoute(pathname)?.title ?? pathname.split('/').filter(Boolean).at(-1)?.replaceAll('-', ' ') ?? 'Dashboard'} · TindaPOS`; }, [title, pathname]);
}
