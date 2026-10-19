import { T } from "../../i18n/T";
import { TextInput, NumberInput, Switch, Select } from '../forms/Fields';
export function SettingText({label,value,onChange,type}:{label:string;value:string;onChange:(value:string)=>void;type?:string}) {return <TextInput label={label} value={value} type={type} onChange={e=>onChange(e.target.value)} />;}
export function SettingNumber({label,value,onChange,min=0,max,step='any'}:{label:string;value:number;onChange:(value:number)=>void;min?:number;max?:number;step?:string}) {return <NumberInput label={label} value={value} min={min} max={max} step={step} onChange={e=>onChange(Number(e.target.value))} />;}
export function SettingToggle({label,value,onChange}:{label:string;value:boolean;onChange:(value:boolean)=>void}) {return <Switch label={label} checked={value} onChange={e=>onChange(e.target.checked)} />;}
export function SettingSelect<T extends string>({label,value,options,onChange}:{label:string;value:T;options:readonly T[];onChange:(value:T)=>void}) {return <Select label={label} value={value} onChange={e=>onChange(e.target.value as T)}>{options.map(o=><option key={o} value={o}><T>{o}</T></option>)}</Select>;}
