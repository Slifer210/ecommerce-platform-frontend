import { OrderStatus } from './order-summary.model';

export interface OrderDetail {
    orderId: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
    paidAt?: string;
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
