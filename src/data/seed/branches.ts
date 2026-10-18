export {defaultBranches as createBranchSeed} from '../../utils/branchMigration';
import type {StockMovement} from '../../types/models';
import {products,variants} from './products';
export function createBranchStockSeed():StockMovement[]{return ['Branch 2','Head Office'].flatMap((branchId,i)=>products.flatMap(p=>(p.hasVariants?variants.filter(v=>v.productId===p.id):[undefined]).map(v=>({id:`seed-stock-${branchId}-${v?.id??p.id}`,branchId,productId:p.id,variantId:v?.id,type:'initial' as const,quantity:i===0?12:3,reason:'Branch opening stock',createdAt:'2026-01-01T00:00:00.000Z',createdBy:'System'}))));}
