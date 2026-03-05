import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductImportResult } from '../models/product-import-result.model';
import { ProductImportBatch } from '../models/product-import-batch.model';


@Injectable({
    providedIn: 'root'
})
export class AdminProductImportService {

    private api = '/api/admin/products';

    constructor(private http: HttpClient) {}

    importFile(file: File): Observable<ProductImportResult> {

        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<ProductImportResult>(
        `${this.api}/import`,
        formData
        );
    }

    deleteBatch(batchId: string): Observable<string> {

        return this.http.delete(
        `${this.api}/import/${batchId}`,
        { responseType: 'text' }
        );
    }

    getImportHistory(): Observable<ProductImportBatch[]> {

        return this.http.get<ProductImportBatch[]>(
        `${this.api}/import`
        );

    }

}