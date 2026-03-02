export interface OrderStatusHistory {
    status:
        | 'PENDING'
        | 'PROCESSING'
        | 'PAID'
        | 'SHIPPED'
        | 'COMPLETED'
        | 'CANCELLED';
    changedAt: string; 
}
