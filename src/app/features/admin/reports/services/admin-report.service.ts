import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SalesReport, SalesReportFilter } from '../models/sales-report.model';

@Injectable({ providedIn: 'root' })
export class AdminReportService {

    private readonly API = '/api/admin/reports';

    constructor(private http: HttpClient) {}

    getSalesReport(filters: SalesReportFilter): Observable<SalesReport> {
        return this.http.get<SalesReport>(
        `${this.API}/sales`,
        { params: { ...filters } }
        );
    }
}
