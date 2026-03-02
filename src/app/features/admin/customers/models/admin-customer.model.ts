export interface AdminCustomer {
    id: string;
    email: string;
    fullName: string | null;
    active: boolean;
    emailVerified: boolean;
    createdAt: string;      // ISO date
    totalOrders: number;    // métricas rápidas para admin
}
