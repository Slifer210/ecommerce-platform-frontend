import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthState } from '../auth/auth.state';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
    const authState = inject(AuthState);
    const router = inject(Router);

    return authState.loadUser().pipe(
        map(user => {
        if (user?.roles?.includes('ADMIN')) {
            return true;
        }

        router.navigate(['/']);
        return false;
        })
    );
};
