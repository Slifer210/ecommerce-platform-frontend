import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class AdminProductCategoryService {

    private baseUrl = '/api/admin/products';

    constructor(private http: HttpClient) {}

    /** Categorías asignadas a un producto */
    getByProduct(productId: string): Observable<Category[]> {
        return this.http.get<Category[]>(
        `${this.baseUrl}/${productId}/categories`
        );
    }

    /** Asignar categoría */
    add(productId: string, categoryId: string) {
        return this.http.post<void>(
        `${this.baseUrl}/${productId}/categories/${categoryId}`,
        {}
        );
    }

    /** Quitar categoría */
    remove(productId: string, categoryId: string) {
        return this.http.delete<void>(
        `${this.baseUrl}/${productId}/categories/${categoryId}`
        );
    }
}
