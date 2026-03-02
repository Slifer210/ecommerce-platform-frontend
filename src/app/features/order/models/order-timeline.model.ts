import { OrderStatus } from './order-summary.model';

export interface OrderTimelineItem {
    status: OrderStatus;
    changedAt: string;
}
