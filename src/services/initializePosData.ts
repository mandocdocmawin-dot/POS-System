import {useCustomerStore} from '../store/useCustomerStore';
import {useOrderStore} from '../store/useOrderStore';
import {useStockStore} from '../store/useStockStore';
import {createPosSeed} from '../data/seed/pos';
export function initializePosData() {
 if (localStorage.getItem('tindapos:customers')===null && localStorage.getItem('tindapos:orders')===null) {
  const seed=createPosSeed();
  // Existing catalogues may have been edited: only seed sales for unchanged, available products.
  const stock=useStockStore.getState().movements;
  const balances=new Map<string,number>();stock.forEach(m=>balances.set(m.productId,(balances.get(m.productId)??0)+(m.type==='out'?-m.quantity:m.quantity)));
  const orders=seed.orders.filter(o=>o.items.every(l=>{const available=balances.get(l.productId)??0;if(available<l.quantity)return false;balances.set(l.productId,available-l.quantity);return true;}));
  useCustomerStore.setState({customers:seed.customers});
  useOrderStore.setState({orders,counter:seed.counter});
  useStockStore.setState({movements:[...stock,...seed.movements.filter(m=>orders.some(o=>o.orderNo===m.reference))]});
 }
}
