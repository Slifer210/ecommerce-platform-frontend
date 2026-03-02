import { Routes } from '@angular/router';

export const productRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
        import('./pages/catalog/catalog.component')
            .then(m => m.CatalogComponent)
    },
    {
        path: ':id',
        loadComponent: () =>
        import('./pages/product-detail/product-detail.component')
            .then(m => m.ProductDetailComponent)
    }
];
