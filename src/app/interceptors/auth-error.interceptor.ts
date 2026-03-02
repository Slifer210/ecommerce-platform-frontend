import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../features/auth/services/auth.service';

export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);

    return next(req).pipe(
        catchError(error => {

        if (error?.status === 401 || error?.status === 403) {
            /**
             * IMPORTANTE:
             * - NO mostrar SweetAlert aquí
             * - NO redirigir
             * - NO bloquear navegación
             *
             * Solo limpiamos sesión silenciosamente.
             */
            authService.logoutSilently();
        }

        // Dejamos que el error continúe
        return throwError(() => error);
        })
    );
};
