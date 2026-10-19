import { T } from "../../i18n/T";
import { useId, useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { searchService } from '../../services/searchService';
import { useLocalData } from '../../services/useLocalData';
import { useHotkeys, isTyping } from '../../hooks/useHotkeys';
export function CommandPalette() {
  const [open, setOpen] = useState(false), [query, setQuery] = useState(''), [selected, setSelected] = useState(0), navigate = useNavigate(), id = useId();
  useLocalData();
  useHotkeys(event => { if ((event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) || (event.key === '/' && !isTyping(event.target))) { event.preventDefault(); setOpen(true); } });
  const results = open && query.trim() ? searchService.search(query) : [];
  const groups = [...new Set(results.map(r => r.group))];
  const ordered = groups.flatMap(group => results.filter(r => r.group === group));
  const choose = (index: number) => { const result = ordered[index]; if (!result) return; searchService.remember(query); navigate(result.link); setOpen(false); setQuery(''); setSelected(0); };
  return <><button className="btn gap-2" aria-label="Search TindaPOS (Control or Command K)" onClick={() => setOpen(true)}><Search size={16} /><span className="hidden xl:inline"><T text={"Search TindaPOS"}/></span><kbd className="hidden text-xs xl:inline">⌘ K</kbd></button>
    <Modal open={open} title="Search TindaPOS" onClose={() => setOpen(false)}>
      <label className="block"><T text={"Search pages and records"}/><input className="mt-2 w-full" role="combobox" aria-expanded="true" aria-controls={`${id}-results`} aria-activedescendant={ordered[selected] ? `${id}-${selected}` : undefined} autoComplete="off" value={query} onChange={e => { setQuery(e.target.value); setSelected(0); }} onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); setSelected(index => (index + (e.key === 'ArrowDown' ? 1 : -1) + ordered.length) % Math.max(ordered.length, 1)); } if (e.key === 'Enter') { e.preventDefault(); choose(selected); } }} /></label>
      <div id={`${id}-results`} role="listbox" aria-label="Search results" className="mt-4 max-h-[55vh] overflow-auto">
        {!query && <div><p className="muted">Recent searches</p>{searchService.recent().map(q => <button className="btn m-1" key={q} onClick={() => { setQuery(q); setSelected(0); }}>{q}</button>)}{!searchService.recent().length && <p>Search for a product, order or page.</p>}</div>}
        {query && !results.length && <p role="status">No results for “{query}”.</p>}
        {ordered.map((result, index) => <div key={`${result.group}:${result.id}`}>{(index === 0 || ordered[index - 1].group !== result.group) && <h3 className="mt-4 p-2 text-xs font-bold uppercase text-slate-500">{result.group}</h3>}<button id={`${id}-${index}`} role="option" aria-selected={index === selected} className={`w-full rounded-lg p-3 text-left ${index === selected ? 'bg-orange-100 text-orange-950 dark:bg-orange-950 dark:text-orange-100' : ''}`} onClick={() => choose(index)}>{result.label}</button></div>)}
      </div><p className="muted mt-4">↑ ↓ Select · Enter Open · Esc Close</p>
    </Modal></>;
}
