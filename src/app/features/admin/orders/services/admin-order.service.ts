import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminOrder } from '../models/admin-order.model';
import { OrderStatusHistory } from '../models/order-status-history.model';

@Injectable({
    providedIn: 'root'
})
export class AdminOrderService {

    private readonly API = '/api/admin/orders';

    constructor(private http: HttpClient) {}

    // ============================
    // LISTAR ÓRDENES (BACKEND FILTER)
    // ============================
    getAll(customerId?: string): Observable<AdminOrder[]> {
        return this.http.get<AdminOrder[]>(
        this.API,
        { params: customerId ? { customerId } : {} }
        );
    }

    // ============================
    // CAMBIOS DE ESTADO
    // ============================
    ship(orderId: string): Observable<void> {
        return this.http.patch<void>(`${this.API}/${orderId}/ship`, {});
    }

    complete(orderId: string): Observable<void> {
        return this.http.patch<void>(`${this.API}/${orderId}/complete`, {});
    }

    // ============================
    // HISTORIAL
    // ============================
    getHistory(orderId: string): Observable<OrderStatusHistory[]> {
        return this.http.get<OrderStatusHistory[]>(
        `${this.API}/${orderId}/history`
        );
    }
}
