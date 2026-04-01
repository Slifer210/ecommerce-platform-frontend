import { Address } from '../../../address/models/address.model';
import { OrderStatus } from '../../../order/models/order-summary.model';

export interface AdminOrderDetail {
  orderId: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  paidAt: string | null;
  customerId: string;
  buyerName: string | null;
  buyerEmail: string | null;
  buyerPhone: string | null;
  buyerDocument: string | null;
  shippingAddress: Address | null;
  items: AdminOrderItem[];
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}
