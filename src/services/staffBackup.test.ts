import { beforeEach, describe, expect, it, vi } from 'vitest';
const { storage, images } = vi.hoisted(() => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); }, clear: () => values.clear() };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  Object.defineProperty(globalThis, 'window', { value: { localStorage: storage }, configurable: true });
  return { storage, images: { export: vi.fn(async () => ({} as Record<string, string>)), import: vi.fn(async (rows: [string, Blob][]) => { void rows; }), remove: vi.fn(async (id: string) => { void id; }) } };
});
vi.mock('./imageService', () => ({ imageService: images }));
import { dataService } from './dataService';
import { authService } from './authService';
import { initializeStaffData } from '../data/seed/phase5';
import { useAuthStore } from '../store/useAuthStore';
import { useStaffStore } from '../store/useStaffStore';
import { usePayrollStore } from '../store/usePayrollStore';
import { useRoleStore } from '../store/useRoleStore';
import { roleService } from './roleService';
import { payrollService } from './payrollService';
import type { Backup } from './backupSchema';
const read = async (): Promise<Backup> => JSON.parse(await dataService.export()) as Backup;
beforeEach(() => {
  vi.restoreAllMocks(); storage.clear(); initializeStaffData(); useAuthStore.setState({ currentUserId: 'staff-admin' }); dataService.reset(); authService.login();
  images.export.mockResolvedValue({}); images.import.mockClear(); images.remove.mockClear();
});
describe('Phase 5 backup and reset', () => {
  it('round trips staff, edited roles, attendance, shifts, payroll snapshots and the demo session', async () => {
    const cashier = useRoleStore.getState().roles.find(r => r.id === 'cashier')!;
    roleService.save({ ...cashier, permissions: [...cashier.permissions, 'orders:refund'] });
    const run = payrollService.create('2027-01-01', '2027-01-15');
    payrollService.transition(run.id, 'finalized');
    const original = await read();
    dataService.reset(); expect(authService.getCurrentUser()).toBeNull(); authService.login();
    await dataService.import(JSON.stringify(original));
    expect(await read()).toEqual(original);
    expect(usePayrollStore.getState().runs.find(r => r.id === run.id)?.status).toBe('finalized');
  });
  it('migrates a pre-Phase-5 backup to fresh staff data and logs out', async () => {
    const { phase5: omitted, ...legacy } = await read();
    expect(omitted.staff.length).toBe(8);
    await dataService.import(JSON.stringify(legacy));
    expect(useStaffStore.getState().staff).toHaveLength(8);
    expect(usePayrollStore.getState().runs.map(r => r.status)).toEqual(['finalized', 'draft']);
    expect(authService.getCurrentUser()).toBeNull();
  });
  it.each(['duplicate email', 'last Admin', 'session', 'attendance', 'manual note', 'shift', 'payroll net', 'payroll overlap', 'Admin permissions'])(
    'rejects %s corruption before any record changes', async kind => {
      const original = await read(), bad = structuredClone(original), d = bad.phase5;
      if (kind === 'duplicate email') d.staff[1].email = d.staff[0].email;
      if (kind === 'last Admin') d.staff[0].status = 'inactive';
      if (kind === 'session') d.auth.currentUserId = 'missing';
      if (kind === 'attendance') d.records.push({ ...d.records[0], id: 'duplicate-record' });
      if (kind === 'manual note') { d.records[0].source = 'manual'; d.records[0].note = ''; }
      if (kind === 'shift') d.shifts[0].endTime = '00:00';
      if (kind === 'payroll net') d.runs[0].lines[0].netPay++;
      if (kind === 'payroll overlap') d.runs[1].periodStart = d.runs[0].periodStart;
      if (kind === 'Admin permissions') d.roles[0].permissions = [];
      await expect(dataService.import(JSON.stringify(bad))).rejects.toThrow();
      expect(await read()).toEqual(original);
    },
  );
  it('exports staff avatars and remaps their image IDs during import', async () => {
    images.export.mockResolvedValue({ 'avatar-original': 'data:image/jpeg;base64,aW1hZ2U=' });
    useStaffStore.setState(s => ({ staff: s.staff.map(p => p.id === 'staff-cashier' ? { ...p, avatarId: 'avatar-original' } : p) }));
    const original = await read(); expect(original.images?.['avatar-original']).toBeDefined();
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 100, height: 100, close: () => {} })));
    try {
      await dataService.import(JSON.stringify(original));
      const id = useStaffStore.getState().staff.find(p => p.id === 'staff-cashier')!.avatarId;
      expect(id).not.toBe('avatar-original'); expect(images.import.mock.calls[0][0][0][0]).toBe(id);
    } finally { vi.unstubAllGlobals(); }
  });
  it('rolls every Phase 5 store back if a write fails midway through import', async () => {
    const original = await read(), changed = structuredClone(original); changed.phase5.staff[0].position = 'Imported position';
    const set = storage.setItem; let reject = true;
    vi.spyOn(storage, 'setItem').mockImplementation((key, value) => { if (key === 'tindapos:payroll' && reject) { reject = false; throw new Error('Disk full'); } set(key, value); });
    await expect(dataService.import(JSON.stringify(changed))).rejects.toThrow();
    expect(await read()).toEqual(original);
  });
  it('denies destructive data operations to Cashier', async () => {
    const backup = await dataService.export(); authService.switchRole('cashier');
    expect(() => dataService.reset()).toThrow("Your role can't do this");
    await expect(dataService.import(backup)).rejects.toThrow("Your role can't do this");
  });
});
