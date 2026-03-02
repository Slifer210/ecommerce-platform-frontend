import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/category.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminCategoryService {

    private readonly API = '/api/admin/categories';

    constructor(private http: HttpClient) {}

    getAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.API);
    }

    create(payload: { name: string }) {
        return this.http.post<Category>(this.API, payload);
    }

    update(id: string, payload: { name: string }) {
        return this.http.put<Category>(`${this.API}/${id}`, payload);
    }

    delete(id: string) {
        return this.http.delete<void>(`${this.API}/${id}`);
    }
}
