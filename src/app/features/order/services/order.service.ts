import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OrderSummary } from '../models/order-summary.model';
import { OrderDetail } from '../models/order-detail.model';
import { OrderTimelineItem } from '../models/order-timeline.model';

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    private readonly API_URL = '/api/orders';

    constructor(private http: HttpClient) {}

    /** Mis órdenes (listado) */
    getMyOrders(): Observable<OrderSummary[]> {
        return this.http.get<OrderSummary[]>(`${this.API_URL}/my`);
    }

    /** Detalle de una orden */
    getOrderDetail(orderId: string): Observable<OrderDetail> {
        return this.http.get<OrderDetail>(`${this.API_URL}/${orderId}`);
    }

    /** Timeline / seguimiento */
    getOrderTimeline(orderId: string): Observable<OrderTimelineItem[]> {
        return this.http.get<OrderTimelineItem[]>(
        `${this.API_URL}/${orderId}/timeline`
        );
    }
    cancelOrder(orderId: string) {
        return this.http.patch(
            `/api/orders/${orderId}/cancel`,
            {}
        );
    }

    completeOrder(orderId: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${orderId}/complete`, {});
    }

    shipOrder(orderId: string): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/${orderId}/ship`, {});
    }

    approvePayment(orderId: string): Observable<void> {
        return this.http.patch<void>(`${this.API_URL}/${orderId}/approve-payment`, {});
    }

    downloadReceipt(orderId: string) {
        return this.http.get(
            `/api/receipts/orders/${orderId}`,
            {
                responseType: 'blob'
            }
        );
    }

    verifyPayment(orderId: string) {
        return this.http.post<void>(
            `/api/payments/verify/${orderId}`,
            {}
        );
    }



}
