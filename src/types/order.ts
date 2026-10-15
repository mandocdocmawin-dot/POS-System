export interface LegacyOrder {
  id: string;
  date: string;
  product: string;
  customer: string;
  items: number;
  total: number;
  paymentStatus: string;
  quantity: number;
  status: string;
  method: string;
}

export type { Order, OrderLine, Payment } from './pos';
