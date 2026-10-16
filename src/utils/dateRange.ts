export interface DateRange {from:string;to:string}
export function inDateRange(date:string,range:DateRange){const day=new Date(date).toLocaleDateString('en-CA');return (!range.from||day>=range.from)&&(!range.to||day<=range.to);}
