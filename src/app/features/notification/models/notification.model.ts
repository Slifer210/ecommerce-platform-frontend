export interface Notification {
    id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    orderId?: string;
    referenceType?: 'QUESTION' | 'ORDER';
    referenceId?: string;
}
