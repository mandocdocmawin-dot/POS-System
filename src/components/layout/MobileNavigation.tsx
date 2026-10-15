import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { IconRail } from './IconRail'
import { Sidebar } from './Sidebar'
import { useUiStore } from '../../store/useUiStore'
export function MobileNavigation() {
 const close = useUiStore(s => s.setMobileOpen); const root = useRef<HTMLDivElement>(null)
 useEffect(() => { const previous = document.activeElement; const overflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; root.current?.querySelector<HTMLElement>('a,button')?.focus(); const key = (event: KeyboardEvent) => { if (event.key === 'Escape') close(false); if (event.key === 'Tab') { const nodes = Array.from(root.current?.querySelectorAll<HTMLElement>('a,button,[tabindex="0"]') ?? []); const first = nodes[0]; const last = nodes[nodes.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() } } }; document.addEventListener('keydown', key); return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); if (previous instanceof HTMLElement) previous.focus() } }, [close])
 return <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={() => close(false)} aria-hidden="true"/><div ref={root} onClick={event => { if ((event.target as HTMLElement).closest("a")) close(false) }} role="dialog" aria-modal="true" aria-label="Navigation" className="relative flex w-[304px] max-w-full shadow-2xl"><IconRail /><Sidebar /><button className="absolute right-2 top-[72px] rounded bg-white p-1 dark:bg-slate-800" aria-label="Close navigation" onClick={() => close(false)}><X size={15}/></button></div></div>
}
