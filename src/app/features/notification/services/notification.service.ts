import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {

    private readonly baseUrl = '/api/notifications';

    constructor(private http: HttpClient) {}

    /* =========================
    * DROPDOWN
    * ========================= */
    getDropdown(): Observable<Notification[]> {
        return this.http.get<Notification[]>(`${this.baseUrl}/dropdown`);
    }

    /* =========================
    * TODAS
    * ========================= */
    getAll(): Observable<Notification[]> {
        return this.http.get<Notification[]>(this.baseUrl);
    }

    /* =========================
    * MARCAR COMO LEÍDA
    * ========================= */
    markAsRead(id: string): Observable<void> {
        return this.http.patch<void>(`${this.baseUrl}/${id}/read`, {});
    }

    /* =========================
    * UNREAD COUNT
    * ========================= */
    getUnreadCount(): Observable<{ count: number }> {
        return this.http.get<{ count: number }>(
        `${this.baseUrl}/unread/count`
        );
    }

    getProductIdByQuestion(questionId: string): Observable<{ productId: string }> {
        return this.http.get<{ productId: string }>(
        `/api/questions/${questionId}/product`
        );
    }
}
