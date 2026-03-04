import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { authGuard } from '../../core/auth/auth.guard';
import { adminGuard } from '../../core/auth/role.guard';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminLayoutComponent,

        canActivate: [authGuard, adminGuard],
        canActivateChild: [adminGuard],

        children: [

        /* ============================
        * REDIRECT
        * ============================ */
        {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard'
        },

        /* ============================
        * DASHBOARD
        * ============================ */
        {
            path: 'dashboard',
            loadComponent: () =>
            import('./dashboard/pages/admin-dashboard/admin-dashboard.component')
                .then(m => m.AdminDashboardComponent)
        },

        /* ============================
        * ORDERS
        * ============================ */
        {
            path: 'orders',
            loadComponent: () =>
            import('./orders/pages/admin-orders/admin-orders.component')
                .then(m => m.AdminOrdersComponent)
        },

        /* ============================
        * CUSTOMERS
        * ============================ */
        {
            path: 'customers',
            loadComponent: () =>
            import('./customers/pages/admin-customers/admin-customers.component')
                .then(m => m.AdminCustomersComponent)
        },

        /* ============================
        * PRODUCTS
        * ============================ */
        {
            path: 'products',
            loadComponent: () =>
            import('./products/pages/admin-products/admin-products.component')
                .then(m => m.AdminProductsComponent)
        },

        /* ============================
        * CATEGORIES
        * ============================ */
        {
            path: 'categories',
            loadComponent: () =>
            import('./categories/pages/admin-categories/admin-categories.component')
                .then(m => m.AdminCategoriesComponent)
        },

        /* ============================
        * QUESTIONS (QA)
        * ============================ */
        {
            path: 'questions',
            loadComponent: () =>
                import('./products-qa/pages/admin-qa-inbox/admin-qa-inbox.component')
                    .then(m => m.AdminQaInboxComponent)
        },

        /* ============================
        * IMPORT PRODUCTS
        * ============================ */
        {
            path: 'products/import',
            loadComponent: () =>
                import('./products/pages/admin-product-import/admin-product-import.component')
                .then(m => m.AdminProductImportComponent)
        },


        /* ============================
        * REPORTS
        * ============================ */
        {
            path: 'reports',
            children: [

            /* HOME */
            {
                path: '',
                loadComponent: () =>
                import('./reports/pages/reports-home/reports-home.component')
                    .then(m => m.ReportsHomeComponent)
            },

            /* SALES REPORT */
            {
                path: 'sales',
                loadComponent: () =>
                import('./reports/pages/sales-report/sales-report.component')
                    .then(m => m.SalesReportComponent)
            },

            /* CUSTOMERS REPORT */
            {
                path: 'customers',
                loadComponent: () =>
                import('./reports/pages/customers-report/customers-report.component')
                    .then(m => m.CustomersReportComponent)
            },

            /* PRODUCTS REPORT */
            {
                path: 'products',
                loadComponent: () =>
                import('./reports/pages/products-report/products-report.component')
                    .then(m => m.ProductsReportComponent)
            }
            ]
        }
        ]
    }
];
