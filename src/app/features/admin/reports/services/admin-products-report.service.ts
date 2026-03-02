import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ProductsReport, ProductsReportFilter } from '../models/product-report.model';

@Injectable({ providedIn: 'root' })
export class AdminProductsReportService {

    private readonly API = '/api/admin/reports/products';

    constructor(private http: HttpClient) {}

    /**
     * Obtiene el reporte de productos con filtros opcionales
     */
    getProductsReport(
        filters: ProductsReportFilter
    ): Observable<ProductsReport> {

        return this.http.get<ProductsReport>(
        this.API,
        { params: { ...filters } }
        );
    }
}
