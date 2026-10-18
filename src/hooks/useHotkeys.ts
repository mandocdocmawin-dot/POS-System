import { useEffect } from 'react';
export function useHotkeys(onKey: (event: KeyboardEvent) => void) {
  useEffect(() => { document.addEventListener('keydown', onKey); return () => document.removeEventListener('keydown', onKey); }, [onKey]);
}
export function isTyping(target: EventTarget | null) { return target instanceof HTMLElement && !!target.closest('input,textarea,select,[contenteditable=true]'); }
