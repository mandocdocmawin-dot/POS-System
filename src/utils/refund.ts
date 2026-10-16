import type {OrderLine} from '../types/pos';
import type {RefundLine} from '../types/phase4';
import {toCentavos,fromCentavos,ratioCentavos} from './pos';
// Allocate the difference between cumulative rounded entitlements; the final unit
// receives the remainder, including for decimal quantities sold by weight.
export function refundLine(line:OrderLine,quantity:number,previous:RefundLine[]):RefundLine{
 const history=previous.filter(x=>x.orderLineId===line.id);
 const used=history.reduce((n,l)=>n+l.quantity,0);
 if(!Number.isFinite(quantity)||quantity<=0||used+quantity>line.quantity+1e-8)throw new Error('Refund quantity exceeds the remaining sold quantity.');
 const scale=100000000;
 const cumulative=ratioCentavos(toCentavos(line.lineTotal),Math.round(Math.min(line.quantity,used+quantity)*scale),Math.round(line.quantity*scale));
 const already=history.reduce((n,l)=>n+toCentavos(l.lineRefund),0);
 if(cumulative<already)throw new Error('Invalid refund history.');
 return {orderLineId:line.id,productId:line.productId,variantId:line.variantId,quantity,unitPriceSnapshot:line.unitPrice,lineRefund:fromCentavos(cumulative-already)};
}
export function reversedPoints(earned:number,totalRefund:number,paid:number){return paid>0?Math.min(earned,Math.floor(earned*toCentavos(totalRefund)/toCentavos(paid))):0;}
