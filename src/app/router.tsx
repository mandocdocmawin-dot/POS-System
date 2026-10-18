import {createElement} from 'react';
import {RouteGuard} from '../components/auth/RouteGuard';
import {ForbiddenPage} from '../components/auth/ForbiddenPage';
import { createBrowserRouter } from "react-router-dom";
import { routes } from "../config/menu";
import { getPageLoader, implementedPages } from "../config/pageRegistry";
import { MainLayout } from "../layouts/MainLayout";
import { PosLayout } from "../layouts/PosLayout";
import { AuthLayout } from "../layouts/AuthLayout";
const layouts = { main: MainLayout, pos: PosLayout, auth: AuthLayout };
export const router = createBrowserRouter([
  {path:'/403',Component:ForbiddenPage},
  {path:'/landing',lazy:getPageLoader('/landing')},
  {path:'/maintenance',lazy:getPageLoader('/maintenance')},
  {path:'/errors/404',lazy:getPageLoader('/errors/404')},
  {path:'/errors/500',lazy:getPageLoader('/errors/500')},
  {Component:AuthLayout,children:['sign-in','sign-up','forgot-password','two-step-verification','reset-password','successful-password','account-deactivation'].map(path=>({path:`/${path}`,lazy:getPageLoader('/auth/'+path)}))},
  ...Object.entries(layouts).map(([layout, Component]) => ({
    Component: layout === "auth" ? Component : () => createElement(RouteGuard, null, createElement(Component)),
    children: routes
      .filter((route) => route.layout === layout && !['/landing','/maintenance','/errors/404','/errors/500'].includes(route.path))
      .map((route) => ({ path: route.path, lazy: getPageLoader(route.path) }))
      .concat(
        layout === "main"
          ? Object.keys(implementedPages)
              .filter(
                (path) =>
                  ["/profile","/account","/pricing","/calendar","/email","/chat","/products","/inventory","/orders","/customers","/suppliers","/purchases","/staff","/accounts","/reports","/settings","/stores"].some(prefix=>path.startsWith(prefix)) &&
                  !routes.some((r) => r.path === path),
              )
              .map((path) => ({ path, lazy: getPageLoader(path) }))
          : [],
      ),
  })),
  {
    Component: () => createElement(RouteGuard,null,createElement(MainLayout)),
    children: [{ path: "*", lazy: getPageLoader("*") }],
  },
]);
