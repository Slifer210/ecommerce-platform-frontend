import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Profile, IdentityDocumentType } from '../models/profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileApiService {

    private readonly baseUrl = '/api';

    constructor(private http: HttpClient) {}

    getProfile(): Observable<Profile> {
        return this.http.get<Profile>(`${this.baseUrl}/profile`);
    }

    updateProfile(payload: {
        fullName: string;
        identityDocumentTypeId: string | null;
        identityDocumentNumber: string | null;
        phone: string;
    }): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/profile`, payload);
    }

    updateProfilePhoto(imageUrl: string): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/profile/photo`, { imageUrl });
    }

    listIdentityDocumentTypes(): Observable<IdentityDocumentType[]> {
        return this.http.get<IdentityDocumentType[]>(
        `${this.baseUrl}/identity-document-types`
        );
    }
}
