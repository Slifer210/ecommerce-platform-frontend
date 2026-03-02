import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminCustomer } from '../models/admin-customer.model';

@Injectable({
    providedIn: 'root'
})
export class AdminCustomerService {

    private readonly API = '/api/admin/customers';

    constructor(private http: HttpClient) {}

    /* =========================
    * LISTAR CLIENTES
    * ========================= */
    getAll(): Observable<AdminCustomer[]> {
        return this.http.get<AdminCustomer[]>(this.API);
    }

    /* =========================
    * ACTIVAR CLIENTE
    * ========================= */
    activate(customerId: string): Observable<void> {
        return this.http.patch<void>(
        `${this.API}/${customerId}/activate`,
        {}
        );
    }

    /* =========================
    * DESACTIVAR CLIENTE
    * ========================= */
    deactivate(customerId: string): Observable<void> {
        return this.http.patch<void>(
        `${this.API}/${customerId}/deactivate`,
        {}
        );
  }
}
