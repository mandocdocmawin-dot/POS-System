export interface Order {
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
