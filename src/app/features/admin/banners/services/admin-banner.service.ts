import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AdminBanner,
  AdminBannerRequest,
  BannerReorderRequest
} from '../models/admin-banner.model';

@Injectable({
  providedIn: 'root'
})
export class AdminBannerService {
  private readonly api = '/api/admin/banners';

  constructor(private http: HttpClient) {}

  list(): Observable<AdminBanner[]> {
    return this.http.get<AdminBanner[]>(this.api);
  }

  create(payload: AdminBannerRequest): Observable<AdminBanner> {
    return this.http.post<AdminBanner>(this.api, payload);
  }

  update(id: string, payload: AdminBannerRequest): Observable<AdminBanner> {
    return this.http.put<AdminBanner>(`${this.api}/${id}`, payload);
  }

  activate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/activate`, {});
  }

  deactivate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.api}/${id}/deactivate`, {});
  }

  reorder(payload: BannerReorderRequest): Observable<void> {
    return this.http.put<void>(`${this.api}/order`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }
}
