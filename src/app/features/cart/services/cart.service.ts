import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cart } from '../models/cart.model';

@Injectable({
    providedIn: 'root'
})
export class CartService {

    private readonly API_URL = '/api/cart';

    constructor(private http: HttpClient) {}

    /** Obtener carrito actual */
    getCart(): Observable<Cart> {
        return this.http.get<Cart>(this.API_URL);
    }

    /** Agregar producto al carrito */
    addItem(
        productId: string,
        quantity: number = 1
    ): Observable<Cart> {
        return this.http.post<Cart>(
        `${this.API_URL}/items`,
        { productId, quantity }
        );
    }

    /** Actualizar cantidad (delta + / -) */
    updateItemQuantity(
        productId: string,
        delta: number
    ): Observable<Cart> {
        return this.http.patch<Cart>(
        `${this.API_URL}/items/${productId}`,
        { delta }
        );
    }

    /** Eliminar un ítem del carrito */
    removeItem(productId: string): Observable<Cart> {
        return this.http.delete<Cart>(
        `${this.API_URL}/items/${productId}`
        );
    }

    /** Vaciar carrito */
    clearCart(): Observable<Cart> {
        return this.http.delete<Cart>(this.API_URL);
    }
}
