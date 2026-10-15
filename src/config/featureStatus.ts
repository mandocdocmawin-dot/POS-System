import { routes } from './menu'
export type FeatureStatus = 'placeholder' | 'in-progress' | 'done'
export interface FeatureDefinition { status: FeatureStatus; description: string; plannedFeatures: string[] }
const special: Record<string, string[]> = {
 '/inventory/stock-transfer': ['Select source and destination warehouse', 'Add items and quantities', 'Review transfer history'],
 '/products/add-product': ['Enter product details and SKU', 'Set price and stock levels', 'Choose category and product variants'],
 '/reports/sales': ['Filter sales by date and branch', 'Compare revenue and order totals', 'Export a sales summary'],
 '/settings/tax': ['Configure tax names and rates', 'Choose inclusive or exclusive pricing', 'Apply tax rules to products']
}
function plans(path: string, title: string, module: string): string[] {
 if (special[path]) return special[path]
 if (path.startsWith('/settings/')) return [`Configure ${title.toLowerCase()} preferences`, 'Preview changes before saving', 'Save preferences locally']
 if (path.startsWith('/reports/')) return [`Review ${title.toLowerCase()} metrics`, 'Filter results by date and branch', 'Export a report summary']
 if (title.startsWith('Add ') || title.startsWith('New ')) return [`Enter ${title.toLowerCase().replace(/^(add|new) /, '')} details`, 'Validate required fields', 'Save and review the new record']
 return [`View ${title.toLowerCase()} information`, `Search and filter ${module.toLowerCase()} records`, 'Review details and activity history']
}
export const featureStatus: Record<string, FeatureDefinition> = Object.fromEntries(routes.map(route => [route.path, { status: 'placeholder', description: `Your ${route.title.toLowerCase()} workspace is taking shape. This feature is planned for a future phase.`, plannedFeatures: plans(route.path, route.title, route.breadcrumb[1] ?? route.title) }]))

for (const path of ['/', '/pos', '/auth/sign-in', '/auth/sign-up', '/auth/forgot-password']) featureStatus[path].status = 'done'

for (const route of routes.filter(route => route.layout === 'auth')) featureStatus[route.path].status = 'done'
