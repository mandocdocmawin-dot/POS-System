import type {Purchase} from '../types/phase4';
import {toCentavos,fromCentavos} from './pos';
export function aging(purchases:Purchase[],now=new Date()){const buckets=[0,0,0];for(const p of purchases){if(p.receiveStatus==='cancelled')continue;const days=Math.max(0,Math.floor((now.getTime()-new Date(p.date+'T00:00:00').getTime())/86400000));buckets[days<=30?0:days<=60?1:2]+=toCentavos(p.balanceDue);}return buckets.map(fromCentavos);}
