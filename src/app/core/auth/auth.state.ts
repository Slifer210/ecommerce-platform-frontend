import { Injectable, signal, computed } from '@angular/core'; 
import { AuthService } from '../../features/auth/services/auth.service';
import { MeResponse } from '../../features/auth/models/auth.models';
import { Router } from '@angular/router';
import { Observable, of, tap, catchError } from 'rxjs';

const TOKEN_KEY = 'token';

@Injectable({
    providedIn: 'root'
})
export class AuthState {

    private readonly _token = signal<string | null>(null);
    private readonly _user = signal<MeResponse | null>(null);
    private readonly _loading = signal(false);

    /* =========================
    * PUBLIC STATE
    * ========================= */
    readonly user = computed(() => this._user());
    readonly loading = computed(() => this._loading());
    readonly isAuthenticated = computed(() => !!this._token());
    

    readonly isAdmin = computed(() =>
        this._user()?.roles?.includes('ADMIN') ?? false
    );

    readonly isCustomer = computed(() =>
        this._user()?.roles?.includes('CUSTOMER') ?? false
    );

    constructor(private authService: AuthService) {
        console.debug('[AuthState] constructor init');

        const storedToken = localStorage.getItem(TOKEN_KEY);
        console.debug('[AuthState] storedToken', storedToken);

        if (storedToken) {
            this._token.set(storedToken);
            console.debug('[AuthState] token restored from localStorage');
            this.loadUser().subscribe();
        }
    }

    /* =========================
    * TOKEN
    * ========================= */
    setToken(token: string): void {
        console.debug('[AuthState] setToken', token);

        localStorage.setItem(TOKEN_KEY, token);
        this._token.set(token);
        this._user.set(null); // fuerza recarga
    }

    getToken(): string | null {
        const token = this._token();
        console.debug('[AuthState] getToken', token);
        return token;
    }

    /* =========================
    * USER
    * ========================= */
    loadUser(): Observable<MeResponse | null> {
        console.debug('[AuthState] loadUser called');

        if (!this._token()) {
            console.warn('[AuthState] loadUser aborted: no token');
            this._user.set(null);
            return of(null);
        }

        if (this._user()) {
            console.debug('[AuthState] loadUser skipped: user already loaded', this._user());
            return of(this._user());
        }

        console.debug('[AuthState] loading user from API');
        this._loading.set(true);

        return this.authService.me().pipe(
            tap(user => {
                console.debug('[AuthState] user loaded successfully', user);
                this._user.set(user);
                this._loading.set(false);
            }),
            catchError(error => {
                console.error('[AuthState] loadUser error', error);

                // ✅ CORRECCIÓN CLAVE:
                // NO borrar token ni sesión acá
                this.clearState();

                return of(null);
            })
        );
    }

    loadUserAndRedirect(router: Router): void {
        console.debug('[AuthState] loadUserAndRedirect called');

        this.loadUser().subscribe(user => {
            console.debug('[AuthState] loadUserAndRedirect result', user);

            if (!user) {
                console.warn('[AuthState] redirecting to /auth/login');
                router.navigate(['/auth/login']);
                return;
            }

            if (user.roles?.includes('ADMIN')) {
                console.debug('[AuthState] redirecting to /admin');
                router.navigate(['/admin']);
            } else {
                console.debug('[AuthState] redirecting to /products');
                router.navigate(['/products']);
            }
        });
    }

    /* =========================
    * NUEVO: UPDATE AVATAR
    * ========================= */
    updateProfileImage(imageUrl: string): void {
        console.debug('[AuthState] updateProfileImage', imageUrl);

        const user = this._user();
        if (!user) {
            console.warn('[AuthState] updateProfileImage skipped: no user');
            return;
        }

        this._user.set({
            ...user,
            profileImageUrl: imageUrl
        });
    }

    readonly isProfileComplete = computed(() => {
        const completed = this.user()?.profileCompleted ?? false;
        console.debug('[AuthState] isProfileComplete', completed);
        return completed;
    });

    /* =========================
    * CLEAR STATE (NUEVO – seguro)
    * ========================= */
    clearState(): void {
        console.warn('[AuthState] clearState called – state only');

        this._user.set(null);
        this._loading.set(false);
    }

    /* =========================
    * CLEAR (SE MANTIENE TAL CUAL)
    * ========================= */
    clear(): void {
        console.warn('[AuthState] clear called – wiping auth state');

        localStorage.removeItem(TOKEN_KEY);
        this._token.set(null);
        this._user.set(null);
    }
}
