import { useState } from 'react';
import { Modal } from './Modal';
export function ConfirmDialog({ open, title, message, onClose, onConfirm }: { open: boolean; title: string; message: string; onClose: () => void; onConfirm: () => void | Promise<void> }) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  return <Modal open={open} title={title} onClose={() => { if (!busy) { setError(''); onClose(); } }}><p className="mb-5">{message}</p>{error && <p role="alert" className="mb-4 text-red-500">{error}</p>}<div className="flex justify-end gap-3"><button className="btn" disabled={busy} onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy} onClick={async () => { setBusy(true); setError(''); try { await onConfirm(); onClose(); } catch (e) { setError(e instanceof Error ? e.message : 'Could not complete the action.'); } finally { setBusy(false); } }}>Confirm</button></div></Modal>;
}
