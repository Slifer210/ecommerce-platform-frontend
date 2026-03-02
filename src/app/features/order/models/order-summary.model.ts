export interface OrderSummary {
    orderId: string;
    status: OrderStatus;
    total: number;
    createdAt: string; 
    itemsCount: number;
}

export type OrderStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'PAID'
    | 'SHIPPED'
    | 'COMPLETED'
    | 'CANCELLED';
