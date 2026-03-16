import { Component, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthState } from '../../../../core/auth/auth.state';
import { CartState } from '../../../cart/cart.state';
import { AddressState } from '../../../address/models/address.state';
import { AddressApiService } from '../../../address/services/address-api.service';
import { NotificationState } from '../../../notification/state/notification.state';
import { NotificationDropdownComponent } from '../../../notification/components/notification-dropdown/notification-dropdown.component';
import { signal } from '@angular/core';
import { OrderService } from '../../../order/services/order.service';
@Component({
  selector: 'app-shop-header-customer-actions',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationDropdownComponent
  ],
  templateUrl: './shop-header-customer-actions.component.html',
  styleUrls: ['./shop-header-customer-actions.component.css']
})
export class ShopHeaderCustomerActionsComponent
  implements OnInit, OnDestroy {

  profileImageUrl: string | null = null;
  readonly pendingOrdersCount = signal<number>(0);

  /** evita ejecuciones múltiples */
  private cleanedUp = false;

  constructor(
    public authState: AuthState,
    public cartState: CartState,
    public addressState: AddressState,
    private addressApi: AddressApiService,
    private notificationState: NotificationState,
    private orderService: OrderService,
    private router: Router
  ) {
    effect(
      () => {
        const user = this.authState.user();
        this.profileImageUrl = user?.profileImageUrl ?? null;

        // logout reactivo
        if (!this.authState.isAuthenticated()) {
          this.cleanupOnce();
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    // admin o no autenticado → no inicializa nada
    if (
      !this.authState.isAuthenticated() ||
      this.authState.user()?.roles?.includes('ADMIN')
    ) {
      return;
    }

    // carrito
    this.cartState.loadCart();

    // notificaciones
    this.notificationState.loadDropdown();
    this.notificationState.startPolling();

    // órdenes pendientes
    this.orderService.getPendingOrdersCount().subscribe({
      next: res => this.pendingOrdersCount.set(res.count),
      error: () => this.pendingOrdersCount.set(0)
    });

    // dirección
    this.addressApi.getDefault().subscribe({
      next: address => this.addressState.setDefault(address),
      error: () => this.addressState.clear()
    });
  }

  ngOnDestroy(): void {
    this.cleanupOnce();
  }

  /**
   * ✅ Limpieza idempotente
   * (se puede llamar varias veces sin efectos secundarios)
   */
  private cleanupOnce(): void {
    if (this.cleanedUp) {
      return;
    }

    this.cleanedUp = true;

    this.notificationState.stopPolling();
    this.cartState.reset();
    this.addressState.clear();
  }

  logout(): void {
    Swal.close();
    this.authState.clear();
    this.router.navigate(['/products']);
  }
}
