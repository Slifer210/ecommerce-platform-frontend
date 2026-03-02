import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from './auth.state';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
    const authState = inject(AuthState);
    const router = inject(Router);

    // Sin token → fuera
    if (!authState.isAuthenticated()) {
        router.navigate(['/auth/login']);
        return false;
    }

    // Esperar carga real del usuario
    return authState.loadUser().pipe(
        map(user => {
        if (!user) {
            router.navigate(['/auth/login']);
            return false;
        }
        return true;
        })
    );
};
