import { createBrowserRouter } from 'react-router-dom'
import { routes } from '../config/menu'
export const router = createBrowserRouter([...routes.map(route => ({ path: route.path, lazy: () => import('../pages/misc/RoutePage') })), { path: '*', lazy: () => import('../pages/misc/RoutePage') }])
