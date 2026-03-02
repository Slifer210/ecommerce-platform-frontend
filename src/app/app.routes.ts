import { Routes } from '@angular/router';
import { OauthRedirectComponent } from './features/auth/pages/oauth-redirect/oauth-redirect.component';

export const routes: Routes = [

    {
        path: 'oauth2/redirect',
        component: OauthRedirectComponent
    },

    {
        path: 'auth',
        loadChildren: () =>
        import('./features/auth/auth.routes')
            .then(m => m.authRoutes)
    },

    {
        path: 'admin',
        loadChildren: () =>
        import('./features/admin/admin.routes')
            .then(m => m.ADMIN_ROUTES)
    },

    {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
    },

    {
        path: '',
        loadChildren: () =>
        import('./features/layout/shop.routes')
            .then(m => m.shopRoutes)
    },

    {
        path: '**',
        redirectTo: ''
    }
];
