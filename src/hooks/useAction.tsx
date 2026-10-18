import {useState} from 'react';
import {toast,errorMessage} from '../services/toastService';
export function useAction() {
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const run = async (action: () => unknown | Promise<unknown>, success?: string) => {
    setError(''); setBusy(true);
    try { await action(); if (success) toast.success(success); } catch (error) { setError(errorMessage(error)); } finally { setBusy(false); }
  };
  return { run, busy, error, feedback: error ? <p className="rounded-lg border border-red-400 p-3 text-red-700 dark:text-red-300" role="alert">{error}</p> : null };
}
