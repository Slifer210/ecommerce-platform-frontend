import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminDashboard } from '../models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {

    private readonly API = '/api/admin/dashboard';

    constructor(private http: HttpClient) {}

    getDashboard(from?: string, to?: string): Observable<AdminDashboard> {

        let params = new HttpParams();

        if (from) params = params.set('from', from);
        if (to) params = params.set('to', to);

        return this.http.get<AdminDashboard>(this.API, { params });
    }
}
