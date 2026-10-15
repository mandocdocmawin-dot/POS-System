import { createBrowserRouter } from 'react-router-dom'
import { routes } from '../config/menu'
import { MainLayout } from '../layouts/MainLayout'
import { PosLayout } from '../layouts/PosLayout'
import { AuthLayout } from '../layouts/AuthLayout'
export const router = createBrowserRouter([
 { Component: MainLayout, children: [...routes.filter(route => route.layout === 'main').map(route => ({ path: route.path, lazy: route.path === '/' ? () => import('../pages/dashboard/DashboardPage') : route.path.startsWith('/errors/') ? () => import('../pages/errors/ErrorPage') : () => import('../pages/misc/RoutePage') })), { path: '*', lazy: () => import('../pages/errors/ErrorPage') }] },
 { Component: PosLayout, children: routes.filter(route => route.layout === 'pos').map(route => ({ path: route.path, lazy: () => import('../pages/pos/PosPage') })) },
 { Component: AuthLayout, children: routes.filter(route => route.layout === 'auth').map(route => ({ path: route.path, lazy: () => import('../pages/auth/AuthPage') })) }
])
