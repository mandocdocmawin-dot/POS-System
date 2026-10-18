import { expect, it } from 'vitest';
import { maintenanceBlocked } from './maintenance';
it('blocks app routes for ordinary users but preserves auth, errors, landing and administrator access', () => {
  expect(maintenanceBlocked(true, '/pos', false)).toBe(true);
  expect(maintenanceBlocked(true, '/pos', true)).toBe(false);
  expect(maintenanceBlocked(false, '/pos', false)).toBe(false);
  for (const path of ['/maintenance', '/landing', '/sign-in', '/auth/sign-in', '/403', '/errors/404', '/errors/500']) expect(maintenanceBlocked(true, path, false)).toBe(false);
});
