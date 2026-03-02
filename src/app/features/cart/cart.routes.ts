import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const cartRoutes: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
        import('./pages/cart/cart.component')
            .then(m => m.CartComponent)
    }
];
