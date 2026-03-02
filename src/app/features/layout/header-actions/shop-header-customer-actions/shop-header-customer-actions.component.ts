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

  /** evita ejecuciones múltiples */
  private cleanedUp = false;

  constructor(
    public authState: AuthState,
    public cartState: CartState,
    public addressState: AddressState,
    private addressApi: AddressApiService,
    private notificationState: NotificationState,
    private router: Router
  ) {
    /**
     * 🔁 Reaccionar a cambios del usuario
     * ⚠️ Este effect ESCRIBE signals → allowSignalWrites: true
     */
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
