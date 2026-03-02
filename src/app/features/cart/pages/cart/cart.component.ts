import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartState } from '../../cart.state';
import { CheckoutService } from '../../services/checkout.service';
import Swal from 'sweetalert2';
import { AuthState } from '../../../../core/auth/auth.state';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html'
})
export class CartComponent implements OnInit {

  constructor(
    public cartState: CartState,
    private checkoutService: CheckoutService,
    private router: Router,
    private authState: AuthState
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
    if (!cart || cart.items.length === 0) return;

    if (!this.authState.isProfileComplete()) {
      Swal.fire({
        icon: 'warning',
        title: 'Completa tu perfil',
        text: 'Antes de pagar necesitamos tus datos personales.',
        confirmButtonText: 'Completar ahora'
      }).then(result => {
        if (result.isConfirmed) {
          this.router.navigate(['/profile'], {
            queryParams: { redirect: 'checkout' }
          });
        }
      });
      return;
    }

    this.checkoutService.startCheckout().subscribe({
      next: res => window.location.href = res.initPoint,
      error: err => {
        if (err.status === 409 && err.error === 'PROFILE_INCOMPLETE') {
          Swal.fire({
            icon: 'info',
            title: 'Perfil incompleto',
            text: 'Por favor completa tu perfil para continuar.'
          }).then(() => {
            this.router.navigate(['/profile'], {
              queryParams: { redirect: 'checkout' }
            });
          });
        } else {
          console.error('Error iniciando checkout', err);
        }
      }
    });
  }
}
