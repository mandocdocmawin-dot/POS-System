import { createBrowserRouter } from 'react-router-dom'
import { routes } from '../config/menu'
import { MainLayout } from '../layouts/MainLayout'
export const router = createBrowserRouter([{ Component: MainLayout, children: [...routes.map(route => ({ path: route.path, lazy: () => import('../pages/misc/RoutePage') })), { path: '*', lazy: () => import('../pages/misc/RoutePage') }] }])
