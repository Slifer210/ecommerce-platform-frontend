export interface ProductsReportFilter {
    from?: string;     // YYYY-MM-DD
    to?: string;       // YYYY-MM-DD
    status?: 'ALL' | 'PAID' | 'COMPLETED';
}

export interface ProductsReport {
    summary: ProductsSummary;
    rows: ProductRow[];
}

export interface ProductsSummary {
    totalProducts: number;        // cantidad total de productos vendidos
    totalRevenue: number;         // ingresos totales
    topProductName?: string;      // producto más vendido
}

/**
 * Row enriquecido usando SOLO campos existentes en la BD
 * (Product + Category + OrderItem + Order)
 */
export interface ProductRow {
    productId: string;
    productName: string;
    category: string;

    // Ventas
    totalQuantity: number;
    totalRevenue: number;
    lastSale: string;             // ISO date

    // Producto (ya existen en Product)
    currentPrice: number;
    stock: number;
    reservedStock: number;
    active: boolean;
}
