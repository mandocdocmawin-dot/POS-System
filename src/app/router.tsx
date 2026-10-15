import { createBrowserRouter } from 'react-router-dom'
import { routes } from '../config/menu'
import { MainLayout } from '../layouts/MainLayout'
import { PosLayout } from '../layouts/PosLayout'
export const router = createBrowserRouter([
 { Component: MainLayout, children: [...routes.filter(route => route.layout !== 'pos').map(route => ({ path: route.path, lazy: route.path === '/' ? () => import('../pages/dashboard/DashboardPage') : () => import('../pages/misc/RoutePage') })), { path: '*', lazy: () => import('../pages/misc/RoutePage') }] },
 { Component: PosLayout, children: [{ path: '/pos', lazy: () => import('../pages/pos/PosPage') }] }
])
