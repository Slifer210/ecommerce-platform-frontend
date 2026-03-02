import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    MeResponse,
    VerifyEmailResponse
} from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly BASE_URL = `${environment.apiBase}/auth`;
    private readonly TOKEN_KEY = 'token';

    constructor(private http: HttpClient) {}

    login(data: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(
        `${this.BASE_URL}/login`,
        data
        );
    }

    register(data: RegisterRequest): Observable<void> {
        return this.http.post<void>(
        `${this.BASE_URL}/register`,
        data
        );
    }

    me(): Observable<MeResponse> {
        const token = this.getToken();

        if (!token) {
        return throwError(() => new Error('No JWT token found'));
        }

        return this.http.get<MeResponse>(
        `${this.BASE_URL}/me`
        );
    }

    verifyEmail(token: string): Observable<VerifyEmailResponse> {
        const params = new HttpParams().set('token', token);

        return this.http.get<VerifyEmailResponse>(
        `${this.BASE_URL}/verify`,
        { params }
        );
    }

    requestPasswordReset(email: string) {
        return this.http.post(
        `${environment.apiBase}/auth/password-reset/request`,
        { email }
        );
    }

    confirmPasswordReset(token: string, newPassword: string) {
        return this.http.post(
        `${environment.apiBase}/auth/password-reset/confirm`,
        { token, newPassword }
        );
    }

    loginWithGoogle(): void {
        window.location.href = environment.googleAuthUrl;
    }

    saveToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    clearToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    logoutSilently(): void {
        this.clearToken();
    }

    logout(): void {
        this.logoutSilently();
    }

}