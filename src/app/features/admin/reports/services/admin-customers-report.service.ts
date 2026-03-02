import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CustomersReport, CustomersReportFilter } from '../models/customer-report.model';

@Injectable({ providedIn: 'root' })
export class AdminCustomersReportService {

    private readonly API = '/api/admin/reports/customers';

    constructor(private http: HttpClient) {}

    /**
     * Obtiene el reporte de clientes con filtros opcionales
     */
    getCustomersReport(
        filters: CustomersReportFilter
    ): Observable<CustomersReport> {

        return this.http.get<CustomersReport>(
        this.API,
        { params: { ...filters } }
        );
    }
}
