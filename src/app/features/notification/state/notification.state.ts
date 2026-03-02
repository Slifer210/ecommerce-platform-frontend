import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationState {

  /** Notificaciones para el dropdown (últimas N) */
  private _dropdownNotifications = signal<Notification[]>([]);

  /** Notificaciones completas para la page */
  private _allNotifications = signal<Notification[]>([]);

  /** Contador global */
  private _unreadCount = signal<number>(0);

  private pollingId: any = null;

  /* =========================
   * SELECTORS
   * ========================= */

  dropdownNotifications = this._dropdownNotifications.asReadonly();
  allNotifications = this._allNotifications.asReadonly();
  unreadCount = this._unreadCount.asReadonly();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  /* =========================
   * LOADERS
   * ========================= */

  loadDropdown(): void {
    this.notificationService.getDropdown().subscribe({
      next: list => this._dropdownNotifications.set(list),
      error: err =>
        console.error('❌ Error loading dropdown notifications', err)
    });
  }

  loadAll(): void {
    this.notificationService.getAll().subscribe({
      next: list => this._allNotifications.set(list),
      error: err =>
        console.error('❌ Error loading all notifications', err)
    });
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: res => this._unreadCount.set(res.count),
      error: err =>
        console.error('❌ Error loading unread count', err)
    });
  }

  /* =========================
   * POLLING
   * ========================= */

  startPolling(): void {
    if (this.pollingId) return;

    this.loadDropdown();
    this.loadUnreadCount();

    this.pollingId = setInterval(() => {
      this.loadDropdown();
      this.loadUnreadCount();
    }, 15000);
  }

  stopPolling(): void {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }

  /* =========================
   * ACTIONS
   * ========================= */

  markAsRead(id: string): void {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {

        const markRead = (list: Notification[]) =>
          list.map(n =>
            n.id === id ? { ...n, read: true } : n
          );

        this._dropdownNotifications.update(markRead);
        this._allNotifications.update(markRead);
        this._unreadCount.update(c => Math.max(0, c - 1));
      },
      error: err =>
        console.error('❌ Error marking notification as read', err)
    });
  }

  /* =========================
   * 🔔 OPEN NOTIFICATION (DEBUG)
   * ========================= */

  openNotification(notification: Notification): void {

    console.group('🔔 OPEN NOTIFICATION');
    console.log('Notification object:', notification);

    // 1️⃣ marcar como leída
    if (!notification.read) {
      console.log('→ Marking notification as read');
      this.markAsRead(notification.id);
    }

    // 2️⃣ ORDER (legacy + actual)
    let orderId = notification.orderId;

    if (!orderId && notification.message) {
      const match = notification.message.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
      );
      if (match) {
        orderId = match[0];
        console.log('→ OrderId parsed from message:', orderId);
      }
    }

    if (orderId) {
      console.log('➡️ Navigating to ORDER:', orderId);
      this.router.navigate(['/my-orders', orderId]);
      console.groupEnd();
      return;
    }

    // 3️⃣ QUESTION (nuevo flujo)
    console.log('referenceType:', notification.referenceType);
    console.log('referenceId:', notification.referenceId);

    if (
      notification.referenceType === 'QUESTION' &&
      notification.referenceId
    ) {
      console.log(
        '➡️ Resolving product for QUESTION:',
        notification.referenceId
      );

      this.notificationService
        .getProductIdByQuestion(notification.referenceId)
        .subscribe({
          next: res => {
            console.log('✅ Product resolved:', res.productId);

            this.router.navigate(
              ['/products', res.productId],
              {
                queryParams: {
                  question: notification.referenceId
                }
              }
            );
          },
          error: err => {
            console.error(
              '❌ Error resolving product from question',
              err
            );
          }
        });

      console.groupEnd();
      return;
    }

    // 4️⃣ fallback
    console.warn('⚠️ No navigation rule matched for notification');
    console.groupEnd();
  }
}
