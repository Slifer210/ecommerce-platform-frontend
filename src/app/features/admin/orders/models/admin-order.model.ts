export interface AdminOrder {
    orderId: string;
    status: 'PAID' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';
    total: number;
    createdAt: string;
}
