import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Address } from '../models/address.model';


@Injectable({ providedIn: 'root' })
export class AddressApiService {

    private readonly API = '/api/addresses';

    constructor(private http: HttpClient) {}

    list(): Observable<Address[]> {
        return this.http.get<Address[]>(this.API);
    }

    create(dto: Address): Observable<Address> {
        return this.http.post<Address>(this.API, dto);
    }

    update(id: string, dto: Address): Observable<Address> {
        return this.http.put<Address>(`${this.API}/${id}`, dto);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.API}/${id}`);
    }

    setDefault(id: string): Observable<void> {
        return this.http.patch<void>(`${this.API}/${id}/default`, {});
    }

    getDefault(): Observable<Address> {
        return this.http.get<Address>(`${this.API}/default`);
    }

}
