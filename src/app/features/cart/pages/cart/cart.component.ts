import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { CartState } from '../../cart.state';
import { CheckoutService } from '../../services/checkout.service';
import { AuthState } from '../../../../core/auth/auth.state';
import { AddressApiService } from '../../../address/services/address-api.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {

  constructor(
    public cartState: CartState,
    private checkoutService: CheckoutService,
    private router: Router,
    private authState: AuthState,
    private addressApi: AddressApiService
  ) {}

  ngOnInit(): void {

    this.cartState.loadCart();

    if (this.authState.isAuthenticated() && !this.authState.user()) {
      this.authState.loadUser().subscribe();
    }

  }

  increase(productId: string): void {
    this.cartState.increaseQuantity(productId);
  }

  decrease(productId: string): void {
    this.cartState.decreaseQuantity(productId);
  }

  removeItem(productId: string): void {
    this.cartState.removeItem(productId);
  }

  clearCart(): void {
    this.cartState.clear();
  }

  goToCheckout(): void {

    const cart = this.cartState.cart();

    if (!cart || cart.items.length === 0) {

      Swal.fire({
        icon: 'info',
        title: 'Tu carrito está vacío',
        text: 'Agrega productos antes de iniciar el pago.'
      });

      return;
    }

    /* CHECK PERFIL SIN BLOQUEAR */
    const profileIncomplete = !this.authState.isProfileComplete();

    /* CHECK DIRECCION */

    this.addressApi.getDefault().subscribe({

      next: () => {

        if (profileIncomplete) {

          this.showMissingData(true, false);
          return;

        }

        this.startCheckout();

      },

      error: () => {

        if (profileIncomplete) {

          this.showMissingData(true, true);

        } else {

          this.showMissingData(false, true);

        }

      }

    });

  }

  private showMissingData(profile: boolean, address: boolean): void {

    let missing: string[] = [];

    if (profile) missing.push('Completar tu perfil');
    if (address) missing.push('Registrar una dirección de envío');

    Swal.fire({
      icon: 'warning',
      title: 'Faltan datos para continuar',
      html: `
        <div style="text-align:center; font-size:15px;">
          <p style="margin-bottom:10px;">
            Antes de pagar necesitamos:
          </p>

          <div style="display:flex; flex-direction:column; gap:6px; align-items:center;">
            ${missing.map(m => `
              <div style="display:flex; gap:6px; align-items:center;">
                <span style="font-weight:bold;">•</span>
                <span>${m}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `,
      confirmButtonText: 'Completar ahora'
    }).then(result => {

      if (!result.isConfirmed) return;

      if (profile) {

        this.router.navigate(['/profile'], {
          queryParams: { redirect: 'checkout' }
        });

        return;
      }

      if (address) {

        this.router.navigate(['/addresses'], {
          queryParams: { redirect: 'checkout' }
        });

      }

    });

  }

  private startCheckout(): void {

    this.checkoutService.startCheckout().subscribe({

      next: res => {

        window.location.href = res.initPoint;

      },

      error: err => {

        console.error('Error iniciando checkout', err);

        const backendError = err?.error?.message || err?.error;

        if (err.status === 409 && backendError === 'PROFILE_INCOMPLETE') {

          Swal.fire({
            icon: 'info',
            title: 'Perfil incompleto',
            text: 'Por favor completa tu perfil para continuar.'
          }).then(() => {

            this.router.navigate(['/profile'], {
              queryParams: { redirect: 'checkout' }
            });

          });

        }

        else if (err.status === 409 && backendError === 'ADDRESS_REQUIRED') {

          Swal.fire({
            icon: 'warning',
            title: 'Dirección requerida',
            text: 'Debes registrar una dirección de envío.'
          }).then(() => {

            this.router.navigate(['/addresses'], {
              queryParams: { redirect: 'checkout' }
            });

          });

        }

        else if (err.status === 409 && backendError === 'CART_EMPTY') {

          Swal.fire({
            icon: 'info',
            title: 'Carrito vacío',
            text: 'Tu carrito no tiene productos para pagar.'
          });

        }

        else if (err.status === 409 && backendError === 'INSUFFICIENT_STOCK') {

          Swal.fire({
            icon: 'warning',
            title: 'Stock insuficiente',
            text: 'Uno o más productos ya no tienen suficiente stock disponible.'
          }).then(() => {

            this.cartState.loadCart();

          });

        }

        else if (err.status === 409 && backendError === 'TOO_MANY_PENDING_CHECKOUTS') {

          Swal.fire({
            icon: 'warning',
            title: 'Tienes pagos pendientes',
            text: 'Ya tienes 3 órdenes pendientes de pago. Finaliza una antes de iniciar otra.',
            confirmButtonText: 'Ver mis órdenes'
          }).then(result => {

            if (result.isConfirmed) {
              this.router.navigate(['/my-orders']);
            }

          });

        }

        else if (err.status === 409 && backendError === 'ORDER_NOT_PAYABLE') {

          Swal.fire({
            icon: 'warning',
            title: 'Orden no disponible',
            text: 'Esta orden ya no puede pagarse.'
          });

        }

        else if (err.status === 404 && backendError === 'NO_ACTIVE_CHECKOUT') {

          Swal.fire({
            icon: 'info',
            title: 'No hay pago activo',
            text: 'No encontramos un proceso de pago activo.'
          });

        }

        else if (err.status === 500) {

          Swal.fire({
            icon: 'error',
            title: 'Error de pago',
            text: 'No se pudo iniciar el pago. Intenta nuevamente.'
          });

        }

        else {

          Swal.fire({
            icon: 'error',
            title: 'Error inesperado',
            text: 'Ocurrió un problema al iniciar el pago.'
          });

        }

      }

    });

  }

}