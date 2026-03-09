import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { OrderSummary, OrderStatus } from '../../models/order-summary.model';
import { NotificationState } from '../../../notification/state/notification.state';

@Component({
  standalone: true,
  selector: 'app-my-orders',
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {

  readonly orders = signal<OrderSummary[]>([]);
  readonly loading = signal<boolean>(false);

  constructor(
    private orderService: OrderService,
    private router: Router,
    private notificationState: NotificationState
  ) {}

  ngOnInit(): void {
    this.notificationState.loadDropdown();
    this.loadOrders();
  }

  private loadOrders(): void {
    this.loading.set(true);

    this.orderService.getMyOrders().subscribe({
      next: orders => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.orders.set([]);
        this.loading.set(false);
      }
    });
  }

  goToOrderDetail(orderId: string): void {
    this.router.navigate(['/my-orders', orderId]);
  }

  continuePayment(url: string): void {
    if (!url) return;
    window.location.href = url;
  }

  statusLabel(status: OrderStatus): string {
    switch (status) {
      case 'PAID':
        return 'Pagado';

      case 'PROCESSING':
        return 'Pago pendiente';

      case 'SHIPPED':
        return 'Enviado';

      case 'COMPLETED':
        return 'Completado';

      case 'CANCELLED':
        return 'Cancelado';

      default:
        return status;
    }
  }
}