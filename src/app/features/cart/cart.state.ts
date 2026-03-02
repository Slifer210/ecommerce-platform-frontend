import { Injectable, signal, computed } from '@angular/core';
import { CartService } from './services/cart.service';
import { Cart } from './models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartState {

    /* =============================
    * STATE
    * ============================= */
    private readonly _cart = signal<Cart | null>(null);
    private readonly _loading = signal(false);

    /* =============================
    * SELECTORS
    * ============================= */
    readonly cart = computed(() => this._cart());
    readonly loading = computed(() => this._loading());

    /** Total de ítems (sumatoria de cantidades) */
    readonly itemCount = computed(() =>
        this._cart()
        ? this._cart()!.items.reduce((sum, i) => sum + i.quantity, 0)
        : 0
    );

    /** Total monetario */
    readonly totalAmount = computed(() =>
        this._cart()?.totalAmount ?? 0
    );

    constructor(private cartService: CartService) {}

    /* =============================
    * ACTIONS
    * ============================= */

    /** Cargar carrito desde backend */
    loadCart(): void {
        if (this._loading()) return;

        this._loading.set(true);

        this.cartService.getCart().subscribe({
        next: cart => this._cart.set(cart),
        error: () => this._cart.set(null),
        complete: () => this._loading.set(false)
        });
    }

    /** Agregar producto (desde catálogo) */
    addItem(productId: string, quantity: number = 1): void {
        this.cartService.addItem(productId, quantity)
        .subscribe(cart => this._cart.set(cart));
    }

    /** Incrementar cantidad (+) */
    increaseQuantity(productId: string): void {
        this.cartService.updateItemQuantity(productId, +1)
        .subscribe(cart => this._cart.set(cart));
    }

    /** Decrementar cantidad (−) */
    decreaseQuantity(productId: string): void {
        this.cartService.updateItemQuantity(productId, -1)
        .subscribe(cart => this._cart.set(cart));
    }

    /** Quitar producto completamente */
    removeItem(productId: string): void {
        this.cartService.removeItem(productId)
        .subscribe(cart => this._cart.set(cart));
    }

    /** Vaciar carrito */
    clear(): void {
        this.cartService.clearCart()
        .subscribe(cart => this._cart.set(cart));
    }

    /** Limpiar estado (logout) */
    reset(): void {
        this._cart.set(null);
    }
}
