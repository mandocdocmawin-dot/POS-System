import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { PayrollLine } from '../../types/staff';
import { useStaffStore } from '../../store/useStaffStore';
import { toCentavos } from '../../utils/pos';
import { errorMessage } from '../../services/toastService';
import { Modal } from '../common/Modal';
import { payrollMoney } from './PayrollLines';
const item = z.object({ label: z.string().trim().min(1, 'An adjustment label is required.'), amount: z.number().finite().nonnegative() });
const schema = z.object({ additions: z.array(item), deductions: z.array(item) });
type Values = z.infer<typeof schema>;
export function PayrollAdjustment({ line, onClose, onSave }: { line: PayrollLine; onClose: () => void; onSave: (additions: PayrollLine['additions'], deductions: PayrollLine['deductions']) => void }) {
  const staff = useStaffStore(s => s.staff.find(p => p.id === line.staffId));
  const [error, setError] = useState('');
  const fixed = line.deductions.filter(d => d.label === 'Late minutes');
  const { register, control, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: {
    additions: line.additions.map(a => ({ ...a, amount: a.amount / 100 })), deductions: line.deductions.filter(d => d.label !== 'Late minutes').map(d => ({ ...d, amount: d.amount / 100 })),
  } });
  const additions = useFieldArray({ control, name: 'additions' }), deductions = useFieldArray({ control, name: 'deductions' });
  return <Modal open title={`Adjustments · ${staff?.name ?? line.staffId}`} onClose={onClose}><form noValidate className="space-y-5" onSubmit={handleSubmit(values => {
    try { onSave(values.additions.map(a => ({ ...a, amount: toCentavos(a.amount) })), [...fixed, ...values.deductions.map(a => ({ ...a, amount: toCentavos(a.amount) }))]); onClose(); } catch (cause) { setError(errorMessage(cause)); }
  })}>
    <p className="text-sm text-slate-500">Amounts are in PHP. Gross pay and snapshot rates stay fixed.</p>
    {fixed.map(d => <p key={d.label} className="text-sm">{d.label}: {payrollMoney(d.amount)} · computed, locked</p>)}
    {([{ name: 'additions', title: 'Additions', array: additions }, { name: 'deductions', title: 'Manual deductions', array: deductions }] as const).map(group => <fieldset key={group.name} className="space-y-3"><legend className="mb-3 font-semibold">{group.title}</legend>{group.array.fields.map((field, index) => <div key={field.id} className="grid grid-cols-[1fr_110px_auto] gap-2"><input aria-label={`${group.title} ${index + 1} label`} placeholder="Label" {...register(`${group.name}.${index}.label`)} /><input aria-label={`${group.title} ${index + 1} amount in PHP`} type="number" min="0" step="0.01" {...register(`${group.name}.${index}.amount`, { valueAsNumber: true })} /><button className="btn" type="button" aria-label={`Remove ${group.title.toLowerCase()} ${index + 1}`} onClick={() => group.array.remove(index)}>×</button></div>)}<button className="btn" type="button" onClick={() => group.array.append({ label: '', amount: 0 })}>Add {group.name === 'additions' ? 'addition' : 'deduction'}</button></fieldset>)}
    {Object.keys(errors).length > 0 && <p role="alert" className="text-red-500">Enter a label and a valid non-negative PHP amount for every adjustment.</p>}{error && <p role="alert" className="text-red-500">{error}</p>}
    <button className="btn-primary">Apply adjustments</button>
  </form></Modal>;
}
