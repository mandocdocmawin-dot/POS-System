import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useHotkeys, isTyping } from '../../hooks/useHotkeys';
export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);
  useHotkeys(e => { if (e.key === '?' && !isTyping(e.target)) { e.preventDefault(); setOpen(true); } });
  return <Modal open={open} title="Keyboard shortcuts" onClose={() => setOpen(false)}><dl className="grid grid-cols-2 gap-4"><dt>Ctrl / ⌘ K or /</dt><dd>Search pages and records</dd><dt>?</dt><dd>Show shortcuts</dd><dt>Esc</dt><dd>Close a dialog</dd><dt>Tab / Shift Tab</dt><dd>Move focus</dd><dt>↑ ↓ Enter</dt><dd>Choose search results</dd></dl><h3 className="mt-6 mb-3 font-semibold">POS</h3><dl className="grid grid-cols-2 gap-3">{[['F2','Focus product search'],['F4','Choose customer'],['F8','Payment'],['F9','Hold order'],['F10','Clear cart (confirm)'],['+ / −','Change selected line quantity'],['Enter','Complete valid payment']].map(([key,label])=><div className="contents" key={key}><dt>{key}</dt><dd>{label}</dd></div>)}</dl></Modal>;
}
