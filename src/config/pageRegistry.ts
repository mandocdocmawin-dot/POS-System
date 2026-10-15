// Add a page loader and its path here when a future feature is implemented.
export const pageLoaders = {
  categories: () => import('../pages/products/CategoriesPage'),
  subcategories: () => import('../pages/products/SubcategoriesPage'),
  brands: () => import('../pages/products/BrandsPage'),
  units: () => import('../pages/products/UnitsPage'),
  products: () => import('../pages/products/ProductsPage'),
  productForm: () => import('../pages/products/ProductFormPage'),
  variants: () => import('../pages/products/VariantsPage'),
  stockList: () => import('../pages/inventory/StockListPage'),
  stockIn: () => import('../pages/inventory/StockMovementPage'),
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
  '/products/brands': 'brands',
  '/products/units': 'units',
  '/products': 'products',
  '/products/all-products': 'products',
  '/products/add': 'productForm',
  '/products/add-product': 'productForm',
  '/products/:id/edit': 'productForm',
  '/products/variants': 'variants',
  '/inventory/stock': 'stockList',
  '/inventory/stock-list': 'stockList',
  '/inventory/stock-in': 'stockIn',
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









