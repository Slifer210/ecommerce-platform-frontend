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

  /* =============================
     CARGAR ÓRDENES
  ============================= */

  private loadOrders(): void {

    this.loading.set(true);

    this.orderService.getMyOrders().subscribe({

      next: orders => {

        const filtered = orders.filter(o => o.itemsCount > 0);

        this.orders.set(filtered);
        this.loading.set(false);

      },

      error: () => {

        this.orders.set([]);
        this.loading.set(false);

      }

    });

  }

  /* =============================
     DETALLE
  ============================= */

  goToOrderDetail(orderId: string): void {

    this.router.navigate(['/my-orders', orderId]);

  }

  /* =============================
     LABEL DEL ESTADO
  ============================= */

  statusLabel(status: OrderStatus): string {

    switch (status) {

      case 'PENDING':
        return 'Pago pendiente';

      case 'PROCESSING':
        return 'Confirmando pago';

      case 'PAID':
        return 'Pagado';

      case 'SHIPPED':
        return 'Enviado';

      case 'COMPLETED':
        return 'Entregado';

      case 'CANCELLED':
        return 'Cancelado';

      default:
        return status;

    }

  }

  /* =============================
     COLOR DEL ESTADO
  ============================= */

  statusClass(status: OrderStatus): string {

    switch (status) {

      case 'PENDING':
        return 'text-yellow-600';

      case 'PROCESSING':
        return 'text-blue-600';

      case 'PAID':
        return 'text-green-600';

      case 'SHIPPED':
        return 'text-blue-700';

      case 'COMPLETED':
        return 'text-green-700';

      case 'CANCELLED':
        return 'text-red-600';

      default:
        return 'text-gray-600';

    }

  }

}