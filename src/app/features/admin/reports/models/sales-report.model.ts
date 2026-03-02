/* ================================
 * FILTROS
 * ================================ */
export interface SalesReportFilter {
    from?: string;     // YYYY-MM-DD
    to?: string;       // YYYY-MM-DD
    status?: 'ALL' | 'PAID' | 'COMPLETED';
}

/* ================================
 * REPORTE PRINCIPAL
 * ================================ */
export interface SalesReport {
    summary: SalesSummary;
    chart: SalesChartPoint[];   // gráfico por fecha (opcional pero útil)
    rows: SalesOrderRow[];      // detalle por ORDEN
}

/* ================================
 * RESUMEN (KPIs)
 * ================================ */
export interface SalesSummary {
    totalRevenue: number;           // ingresos totales
    totalOrders: number;            // número de órdenes
    averageTicket: number;          // ingreso promedio por orden
    averageItemsPerOrder: number;   // ítems promedio por orden
}

/* ================================
 * GRÁFICO (EVOLUCIÓN)
 * ================================ */
export interface SalesChartPoint {
    date: string;    // YYYY-MM-DD
    total: number;   // ingresos del día
}

/* ================================
 * FILA DE TABLA (POR ORDEN)
 * ================================ */
export interface SalesOrderRow {
    orderNumber: string;        // identificador de la orden
    date: string;               // ISO date
    customerName: string;       // nombre del cliente
    productsSummary: string;    // "Laptop Gamer + 2 más"
    totalItems: number;         // total de ítems comprados
    total: number;              // total de la orden
    status: 'PAID' | 'COMPLETED';
}
