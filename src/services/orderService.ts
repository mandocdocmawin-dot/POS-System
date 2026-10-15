import { orders } from '../data/orders'
export const orderService = { getOrders: () => orders.map(order => ({ ...order })), getOrder: (id: string) => { const order = orders.find(order => order.id === id); return order ? { ...order } : undefined }, getCurrentOrder: () => ({ id: '#TP1001', items: 0, customer: { name: 'Maria Santos', membership: 'Platinum Member', points: '2,450' } }) }
