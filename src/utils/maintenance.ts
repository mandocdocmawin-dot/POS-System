export function maintenanceBlocked(enabled: boolean, pathname: string, canManageSettings: boolean) {
  return enabled && !canManageSettings && !['/maintenance', '/landing', '/sign-in', '/403', '/errors/404', '/errors/500'].includes(pathname) && !pathname.startsWith('/auth/');
}
