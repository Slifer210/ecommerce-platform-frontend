import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductImage } from '../models/product-image.model';

@Injectable({ providedIn: 'root' })
export class AdminProductImageService {

    private readonly baseUrl = '/api/admin/products';

    constructor(private http: HttpClient) {}

    // ============================
    // LISTAR IMÁGENES
    // ============================
    list(productId: string): Observable<ProductImage[]> {
        return this.http.get<ProductImage[]>(
        `${this.baseUrl}/${productId}/images`
        );
    }

    // ============================
    // AGREGAR IMAGEN
    // ============================
    add(productId: string, imageUrl: string): Observable<ProductImage> {
        return this.http.post<ProductImage>(
        `${this.baseUrl}/${productId}/images`,
        { imageUrl }
        );
    }

    // ============================
    // ELIMINAR IMAGEN
    // ============================
    remove(productId: string, imageId: string): Observable<void> {
        return this.http.delete<void>(
        `${this.baseUrl}/${productId}/images/${imageId}`
        );
    }

    // ============================
    // MARCAR COMO PRINCIPAL
    // ============================
    setMain(productId: string, imageId: string): Observable<void> {
        return this.http.patch<void>(
        `${this.baseUrl}/${productId}/images/${imageId}/main`,
        {}
        );
    }
}
