import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminProduct } from '../models/admin-product.model';

@Injectable({
    providedIn: 'root'
})
export class AdminProductService {

    private readonly API = '/api/admin/products';

    constructor(private http: HttpClient) {}

    getAll(): Observable<AdminProduct[]> {
        return this.http.get<AdminProduct[]>(this.API);
    }

    create(payload: Partial<AdminProduct>): Observable<AdminProduct> {
        return this.http.post<AdminProduct>(this.API, payload);
    }

    update(id: string, payload: Partial<AdminProduct>): Observable<AdminProduct> {
        return this.http.put<AdminProduct>(`${this.API}/${id}`, payload);
    }

    deactivate(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API}/${id}`);
    }

    activate(id: string): Observable<void> {
        return this.http.patch<void>(`${this.API}/${id}/activate`, {});
    }

    exportProducts(filters: any = {}, format: 'csv' | 'xlsx' | 'pdf' = 'csv') {

        const params: any = { ...filters, format };

        return this.http.get(`${this.API}/export`, {
            params,
            responseType: 'blob'
        });
    }
}
