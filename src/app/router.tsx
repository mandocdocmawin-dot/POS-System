import { createBrowserRouter } from 'react-router-dom'
import { routes } from '../config/menu'
import { getPageLoader } from '../config/pageRegistry'
import { MainLayout } from '../layouts/MainLayout'
import { PosLayout } from '../layouts/PosLayout'
import { AuthLayout } from '../layouts/AuthLayout'
const layouts = { main: MainLayout, pos: PosLayout, auth: AuthLayout }
export const router = createBrowserRouter([
 ...Object.entries(layouts).map(([layout, Component]) => ({ Component, children: routes.filter(route => route.layout === layout).map(route => ({ path: route.path, lazy: getPageLoader(route.path) })) })),
 { Component: MainLayout, children: [{ path: '*', lazy: getPageLoader('*') }] },
])
