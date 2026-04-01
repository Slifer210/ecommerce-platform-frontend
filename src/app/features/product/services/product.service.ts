import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CatalogHomeResponse } from '../models/catalog-home.model';
import { CatalogProduct } from '../models/catalog-product.model';
import { CatalogPageResponse } from '../models/catalog-facets.response';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    private readonly API_URL = '/api/products';
    private readonly CATALOG_HOME_URL = '/api/catalog/home';

    constructor(private http: HttpClient) {}

    getCatalogProducts(params: {
        categoryId?: string | null;
        search?: string | null;
        minPrice?: number | null;
        maxPrice?: number | null;
        attributes?: Record<string, string[]>;
        page?: number;
        size?: number;
        sort?: string; 
    }): Observable<CatalogPageResponse> {

        let httpParams = new HttpParams();

        // Basic filters
        if (params.categoryId) {
        httpParams = httpParams.set('categoryId', params.categoryId);
        }

        if (params.search) {
        httpParams = httpParams.set('search', params.search);
        }

        if (params.minPrice != null) {
        httpParams = httpParams.set('minPrice', params.minPrice.toString());
        }

        if (params.maxPrice != null) {
        httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
        }

        // Sorting
        if (params.sort) {
        httpParams = httpParams.set('sort', params.sort);
        }

        /* =====================================================
        ✅ CORRECCIÓN CLAVE:
        Enviar atributos como attr_<name>=<value>
        para que el backend los detecte correctamente.
        ===================================================== */
        if (params.attributes) {
        Object.entries(params.attributes)
            .filter(([attrName, values]) => !!attrName && !!values?.length)
            .forEach(([attrName, values]) => {
            values.forEach(value => {
                if (value != null && value.toString().trim().length > 0) {
                httpParams = httpParams.append(`attr_${attrName}`, value);
                }
            });
            });
        }

        // Pagination (siempre presente)
        httpParams = httpParams
        .set('page', (params.page ?? 0).toString())
        .set('size', (params.size ?? 12).toString());

        return this.http.get<CatalogPageResponse>(this.API_URL, { params: httpParams });
    }

    getProductById(id: string): Observable<CatalogProduct> {
        return this.http.get<CatalogProduct>(`${this.API_URL}/${id}`);
    }

    getCatalogHome(): Observable<CatalogHomeResponse> {
        return this.http.get<CatalogHomeResponse>(this.CATALOG_HOME_URL);
    }
}
