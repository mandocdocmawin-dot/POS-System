import {usePosStore} from '../store/usePosStore';
import {productService} from './productService';
import {formatOrderNo} from '../utils/orderNo';
import {useCustomerStore} from '../store/useCustomerStore';
import {useOrderStore} from '../store/useOrderStore';
import {useStockStore} from '../store/useStockStore';
import {createPosSeed} from '../data/seed/pos';
export function initializePosData() {
 if (useCustomerStore.getState().customers.length===0 && useOrderStore.getState().orders.length===0) {
  const seed=createPosSeed();
  // Existing catalogues may have been edited: only seed sales for unchanged, available products.
  const stock=useStockStore.getState().movements;
  const balances=new Map<string,number>();stock.forEach(m=>balances.set(m.productId,(balances.get(m.productId)??0)+(m.type==='out'?-m.quantity:m.quantity)));
  const orders=seed.orders.filter(o=>o.items.every(l=>{const product=productService.get(l.productId);if(!product||product.hasVariants)return false;const available=balances.get(l.productId)??0;if(available<l.quantity)return false;balances.set(l.productId,available-l.quantity);return true;}));
  const customers=seed.customers.map(c=>({...c,points:orders.filter(o=>o.customerId===c.id).reduce((n,o)=>n+o.pointsEarned,0)}));
  useCustomerStore.setState({customers});
  useOrderStore.setState({orders,counter:seed.counter});
  usePosStore.setState({activeOrderNo:formatOrderNo(seed.counter+1)});
  useStockStore.setState({movements:[...stock,...seed.movements.filter(m=>orders.some(o=>o.orderNo===m.reference))]});
 }
}
