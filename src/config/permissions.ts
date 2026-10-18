import type { Role } from '../types/staff';
export const permissionKeys=['dashboard:view','products:view','products:create','products:edit','products:delete','inventory:view','inventory:adjust','pos:use','pos:discount','pos:hold','orders:view','orders:refund','orders:cancel','customers:view','customers:edit','customers:manage','suppliers:view','suppliers:manage','purchases:view','purchases:create','staff:view','staff:manage','attendance:view','attendance:manage','schedule:view','schedule:manage','holidays:view','holidays:manage','roles:manage','payroll:view','settings:manage','reports:view','reports:finance','accounts:view','accounts:manage','pages:view'] as const;
export type Permission=typeof permissionKeys[number];
export const defaultRoles:Role[]=[
{id:'admin',name:'Admin',description:'Full access to every workspace and staff setting',permissions:[...permissionKeys],isSystem:true},
{id:'manager',name:'Manager',description:'Sales, inventory and team operations; payroll and staff management excluded',permissions:permissionKeys.filter(p=>!['staff:manage','payroll:view','settings:manage','accounts:manage','reports:finance'].includes(p)),isSystem:true},
{id:'cashier',name:'Cashier',description:'POS, order history, products, new customers and own attendance',permissions:['pos:use','pos:hold','orders:view','customers:view','customers:edit','products:view','attendance:view','schedule:view'],isSystem:true}];
export const routePermissions:Record<string,Permission>={
'/reports/finance':'reports:finance','/':'dashboard:view','/pos':'pos:use','/products':'products:view','/products/add':'products:create','/products/add-product':'products:create','/products/:id/edit':'products:edit','/inventory':'inventory:view','/inventory/stock-in':'inventory:adjust','/inventory/stock-out':'inventory:adjust','/inventory/adjustment':'inventory:adjust','/inventory/stock-adjustment':'inventory:adjust','/orders':'orders:view','/orders/refunded':'orders:refund','/customers':'customers:view','/customers/add':'customers:edit','/customers/add-customer':'customers:edit','/customers/:id/edit':'customers:manage','/customers/wallet':'customers:manage','/customers/wallet-balance':'customers:manage','/suppliers':'suppliers:view','/suppliers/add':'suppliers:manage','/suppliers/add-supplier':'suppliers:manage','/suppliers/:id/edit':'suppliers:manage','/purchases':'purchases:view','/purchases/add':'purchases:create','/purchases/add-purchase':'purchases:create',
'/staff':'staff:view','/staff/add':'staff:manage','/staff/add-staff':'staff:manage','/staff/:id/edit':'staff:manage','/staff/roles':'roles:manage','/staff/role-permission':'roles:manage','/staff/attendance':'attendance:view','/staff/payroll':'payroll:view','/staff/schedule':'schedule:view','/staff/holidays':'holidays:view','/settings':'settings:manage','/reports':'reports:view','/accounts':'accounts:view'};
export function routePermission(path:string):Permission {
 const clean=path.replace(/\/$/,'')||'/';
 if(routePermissions[clean]) return routePermissions[clean];
 for(const [pattern,permission] of Object.entries(routePermissions)) if(pattern.includes(':')&&new RegExp('^'+pattern.replace(':id','[^/]+')+'$').test(clean))return permission;
 const parent=Object.keys(routePermissions).filter(p=>p!=='/'&&!p.includes(':')&&clean.startsWith(p+'/')).sort((a,b)=>b.length-a.length)[0];
 return parent?routePermissions[parent]:'pages:view';
}
export const CASHIER_DISCOUNT_LIMIT=10;
export function migratePhase6Roles(roles:Role[]):Role[]{return roles.map(role=>{if(!role.isSystem)return role;if(role.id==='admin')return {...role,permissions:[...new Set([...role.permissions,'accounts:manage','reports:finance'])]};if(role.id==='manager')return {...role,permissions:[...new Set([...role.permissions,'accounts:view','reports:view'])]};return role;});}


