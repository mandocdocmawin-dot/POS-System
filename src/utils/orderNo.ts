export function formatOrderNo(counter:number):string {
 if(!Number.isSafeInteger(counter)||counter<1)throw new Error('Order counter exceeds the supported range.');
 return 'TP-'+String(counter).padStart(6,'0');
}
