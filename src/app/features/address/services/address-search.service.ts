import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AddressSearchService {

    private readonly API = 'https://nominatim.openstreetmap.org/search';

    constructor(private http: HttpClient) {}

    search(query: string): Observable<any[]> {
        const params = new HttpParams()
        .set('q', query)
        .set('format', 'json')
        .set('addressdetails', '1')
        .set('limit', '5');

        return this.http.get<any[]>(this.API, {
        params,
        headers: {
            'Accept-Language': 'es',
            'User-Agent': 'ecommerce-app/1.0 (contact@ecommerce.local)'
        }
        });
    }
}
