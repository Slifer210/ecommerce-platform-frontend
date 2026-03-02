import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AuthSessionService {

    constructor(private router: Router) {}

    clear(): void {
        console.warn('[AuthSession] clear session');

        localStorage.removeItem(TOKEN_KEY);
        this.router.navigate(['/auth/login']);
    }
}
