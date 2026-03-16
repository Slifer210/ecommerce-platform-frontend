import { Address } from '../../address/models/address.model';
import { OrderStatus } from './order-summary.model';

export interface OrderDetail {
    orderId: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
    paidAt?: string;
    buyerName: string;
    buyerEmail: string;
    buyerPhone: string;
    buyerDocument: string;
    shippingAddress: Address;
    items: OrderItem[];
}

export interface OrderItem {
    id: string;                 
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
    reviewed: boolean;          
    showReviewForm?: boolean;   
}
