import {Popover} from '../common/Popover';
export function ShortcutsHelp() {
 return <Popover label="Keyboard shortcuts" trigger={<span className="font-bold">?</span>} className="btn px-3"><div className="w-60 p-2"><p className="mb-3 text-sm font-semibold">Keyboard shortcuts</p><dl className="space-y-2 text-xs">{[['F2','Focus search'],['F4','Choose customer'],['F8','Payment'],['F9','Hold order'],['F10','Clear cart (confirm)'],['Esc','Close top dialog'],['+ / −','Quantity of selected / last line'],['Enter','Complete valid payment']].map(([key,label])=><div className="flex justify-between gap-3" key={key}><dt className="font-mono font-semibold">{key}</dt><dd className="text-right text-slate-500">{label}</dd></div>)}</dl></div></Popover>;
}
