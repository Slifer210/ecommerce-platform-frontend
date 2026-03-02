import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

export const ordersRoutes: Routes = [
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
        import('./pages/my-orders/my-orders.component')
            .then(m => m.MyOrdersComponent)
    },
    {
        path: ':id',
        canActivate: [authGuard],
        loadComponent: () =>
        import('./pages/order-detail/order-detail.component')
            .then(m => m.OrderDetailComponent)
    }
];
