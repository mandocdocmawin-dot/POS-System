import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shiftSchema, type Shift } from '../../types/staff';
import { shiftTemplates } from '../../data/seed/shifts';
import { branches } from '../../store/useBranchStore';
import { useStaffStore } from '../../store/useStaffStore';
import { useShiftStore } from '../../store/useShiftStore';
import { useHolidayStore } from '../../store/useHolidayStore';
import { useAttendanceStore } from '../../store/useAttendanceStore';
import { usePermission } from '../../hooks/usePermission';
import { scheduleService } from '../../services/scheduleService';
import { toast, errorMessage } from '../../services/toastService';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function ShiftEditor({ shift, onClose }: { shift: Shift; onClose: () => void }) {
  const { can } = usePermission();
  const staff = useStaffStore(s => s.staff);
  const shifts = useShiftStore(s => s.shifts);
  // Warnings must stay current if another view edits holidays or leave records.
  useHolidayStore(s => s.holidays);
  useAttendanceStore(s => s.records);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(false);
  const [templateId, setTemplateId] = useState(() => shiftTemplates.find(t => t.startTime === shift.startTime && t.endTime === shift.endTime)?.id ?? 'custom');
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<Shift>({
    resolver: zodResolver(shiftSchema),
    defaultValues: shift,
  });
  const [staffId, date] = useWatch({ control, name: ['staffId', 'date'] });
  const values = { ...shift, staffId, date };
  const warnings = scheduleService.warnings(values);
  const existing = shifts.some(s => s.id === shift.id);

  if (!can('schedule:manage')) return null;

  return (
    <Modal open title={existing ? 'Edit shift' : 'Add shift'} onClose={onClose}>
      <form className="space-y-4" noValidate onSubmit={handleSubmit(input => {
        try {
          scheduleService.save(input);
          toast.success('Shift saved');
          onClose();
        } catch (cause) {
          const message = errorMessage(cause);
          setError(message);
          toast.error(message);
        }
      })}>
        <label className="block text-sm">
          Staff
          <select className="mt-1 w-full" {...register('staffId')}>
            {staff.filter(s => s.status === 'active' || s.id === values.staffId).map(s => (
              <option key={s.id} value={s.id}>{s.name} · {s.staffNo}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Date
          <input className="mt-1 w-full" type="date" {...register('date')} />
        </label>
        <label className="block text-sm">
          Shift template
          <select className="mt-1 w-full" value={templateId} onChange={event => {
            setTemplateId(event.target.value);
            const selected = shiftTemplates.find(t => t.id === event.target.value);
            if (selected) {
              setValue('startTime', selected.startTime, { shouldDirty: true, shouldValidate: true });
              setValue('endTime', selected.endTime, { shouldDirty: true, shouldValidate: true });
            }
          }}>
            <option value="custom">Custom times</option>
            {shiftTemplates.map(t => <option key={t.id} value={t.id}>{t.name} · {t.startTime}–{t.endTime}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">Start time<input className="mt-1 w-full" type="time" {...register('startTime', { onChange: () => setTemplateId('custom') })} /></label>
          <label className="block text-sm">End time<input className="mt-1 w-full" type="time" {...register('endTime', { onChange: () => setTemplateId('custom') })} /></label>
        </div>
        <p className="text-xs text-slate-500">Shifts must end after they start on the same day. Overnight shifts are unavailable.</p>
        <label className="block text-sm">
          Branch
          <select className="mt-1 w-full" {...register('branchId')}>
            {branches.map(branch => <option key={branch}>{branch}</option>)}
          </select>
        </label>
        <label className="block text-sm">Note<textarea className="mt-1 w-full" rows={3} {...register('note')} /></label>
        {warnings.length > 0 && (
          <div role="status" className="space-y-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            {warnings.map(warning => <p key={warning}>{warning}</p>)}
            <p>You can still save this shift.</p>
          </div>
        )}
        {Object.entries(errors).map(([key, value]) => <p role="alert" className="text-sm text-red-500" key={key}>{value.message}</p>)}
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary" disabled={isSubmitting}>Save shift</button>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          {existing && <button type="button" className="btn text-red-500" onClick={() => setRemoving(true)}>Delete shift</button>}
        </div>
      </form>
      <ConfirmDialog open={removing} title="Delete shift?" message="This removes the scheduled shift. Attendance history will be retained." onClose={() => setRemoving(false)} onConfirm={() => {
        scheduleService.remove(shift.id);
        toast.success('Shift deleted');
        onClose();
      }} />
    </Modal>
  );
}
