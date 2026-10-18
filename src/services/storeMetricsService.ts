import {financeData} from './financeData';
import {financeSummary} from '../utils/finance';
import {presetRange} from '../utils/reports/period';
import {branchService} from './branchService';
import {stockService} from './stockService';
import {toCentavos,multiplyCentavos} from '../utils/pos';
export const storeMetricsService={list:()=>branchService.list().map(b=>{const items=stockService.items(b.id);return {...b,staffCount:branchService.staff(b.id).length,stockValue:items.reduce((n,i)=>n+multiplyCentavos(toCentavos(i.cost),Math.max(0,i.stock)),0),lowStock:items.filter(i=>i.stock<=i.product.reorderLevel).length,todaySales:financeSummary(financeData(),{...presetRange('today'),branchId:b.id,compare:false}).revenue};})};
