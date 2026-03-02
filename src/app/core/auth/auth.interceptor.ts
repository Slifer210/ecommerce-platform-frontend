import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthSessionService } from '../services/auth-session.service';


const TOKEN_KEY = 'token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const session = inject(AuthSessionService);

    const token = localStorage.getItem(TOKEN_KEY);

    const excludedUrls = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/verify',
        '/oauth2/',
        '/login/oauth2/',
        'api.cloudinary.com'
    ];

    const shouldExclude = excludedUrls.some(url =>
        req.url.includes(url)
    );

    const authReq = (!token || shouldExclude)
        ? req
        : req.clone({
            setHeaders: {
            Authorization: `Bearer ${token}`
            }
        });

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
            console.warn('[AUTH] 401 detectado → logout global');
            session.clear();
        }

        return throwError(() => error);
        })
    );
};
