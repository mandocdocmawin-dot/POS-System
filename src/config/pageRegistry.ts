// Add a page loader and its path here when a future feature is implemented.
export const pageLoaders = {
  categories: () => import('../pages/products/CategoriesPage'),
  subcategories: () => import('../pages/products/SubcategoriesPage'),
  dashboard: () => import("../pages/dashboard/DashboardPage"),
  pos: () => import("../pages/pos/PosPage"),
  auth: () => import("../pages/auth/AuthPage"),
  error: () => import("../pages/errors/ErrorPage"),
  placeholder: () => import("../pages/misc/RoutePage"),
};
export type PageId = keyof typeof pageLoaders;
export const implementedPages: Record<string, PageId> = {
  '/products/categories': 'categories',
  '/products/subcategories': 'subcategories',
  "/": "dashboard",
  "/pos": "pos",
  "/auth/sign-in": "auth",
  "/auth/sign-up": "auth",
  "/auth/forgot-password": "auth",
  "/auth/two-step-verification": "auth",
  "/auth/reset-password": "auth",
  "/auth/successful-password": "auth",
  "/auth/account-deactivation": "auth",
  "/errors/404": "error",
  "/errors/500": "error",
  "*": "error",
};
export function getPageLoader(path: string) {
  return pageLoaders[implementedPages[path] ?? "placeholder"];
}


