import { createBrowserRouter } from "react-router-dom";
import { routes } from "../config/menu";
import { getPageLoader, implementedPages } from "../config/pageRegistry";
import { MainLayout } from "../layouts/MainLayout";
import { PosLayout } from "../layouts/PosLayout";
import { AuthLayout } from "../layouts/AuthLayout";
const layouts = { main: MainLayout, pos: PosLayout, auth: AuthLayout };
export const router = createBrowserRouter([
  ...Object.entries(layouts).map(([layout, Component]) => ({
    Component,
    children: routes
      .filter((route) => route.layout === layout)
      .map((route) => ({ path: route.path, lazy: getPageLoader(route.path) })).concat(layout === 'main' ? Object.keys(implementedPages).filter(path => (path.startsWith('/products') || path.startsWith('/inventory')) && !routes.some(r => r.path === path)).map(path => ({ path, lazy: getPageLoader(path) })) : []),
  })),
  {
    Component: MainLayout,
    children: [{ path: "*", lazy: getPageLoader("*") }],
  },
]);

