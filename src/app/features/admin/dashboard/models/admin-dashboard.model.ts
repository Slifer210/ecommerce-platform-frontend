import { OrderStatus } from '../../orders/models/order-status.model';

export interface AdminDashboard {
    stats: DashboardStats;
    orderStatus: OrderStatusSummary;
    recentOrders: RecentOrder[];
    salesChart: SalesPoint[];
    activityLogs: ActivityLog[];
}

/* KPIs */
export interface DashboardStats {
    totalSales: number;
    ordersToday: number;
    pendingOrders: number;
    activeProducts: number;
}

/* Estados */
export interface OrderStatusSummary {
    paid: number;
    shipped: number;
    completed: number;
    cancelled: number;
}

/* Últimas órdenes */
export interface RecentOrder {
    id: string;
    status: OrderStatus;
    total: number;
    createdAt: string;
}

/* Gráfico */
export interface SalesPoint {
    date: string;   // YYYY-MM-DD
    total: number;  // 1234.56
}

/* Activity log */
export interface ActivityLog {
    type: 'ORDER' | 'PRODUCT' | 'PAYMENT';
    message: string;
    createdAt: string;
}
