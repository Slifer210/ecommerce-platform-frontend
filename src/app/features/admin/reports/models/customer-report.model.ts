/**
 * ============================
 * FILTROS
 * ============================
 */
export interface CustomersReportFilter {
    from?: string;        // YYYY-MM-DD
    to?: string;          // YYYY-MM-DD
    status?: 'ALL' | 'PAID' | 'COMPLETED';
}

/**
 * ============================
 * RESPONSE PRINCIPAL
 * ============================
 */
export interface CustomersReport {
    summary: CustomersSummary;
    rows: CustomerRow[];
}

/**
 * ============================
 * KPIs
 * ============================
 */
export interface CustomersSummary {
    totalCustomers: number;
    activeCustomers: number;
    averageRevenuePerCustomer: number;
}

/**
 * ============================
 * FILA DE TABLA
 * ============================
 */
export interface CustomerRow {
    userId: string;
    fullName: string;
    email: string;
    totalOrders: number;
    totalSpent: number;
    lastPurchase: string;   // ISO date (yyyy-MM-dd)
}
