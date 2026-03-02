import { Routes } from '@angular/router';
import { ShopLayoutComponent } from './shop-layout/shop-layout.component';

export const shopRoutes: Routes = [
    {
        path: '',
        component: ShopLayoutComponent,
        children: [

        // Catálogo
        {
            path: 'products',
            loadChildren: () =>
            import('../product/product.routes')
                .then(m => m.productRoutes)
        },

        // Carrito
        {
            path: 'cart',
            loadChildren: () =>
            import('../cart/cart.routes')
                .then(m => m.cartRoutes)
        },

        // Mis órdenes
        {
        path: 'my-orders',
        loadChildren: () =>
            import('../order/orders.routes')
            .then(m => m.ordersRoutes)
        },


        {
            path: 'addresses',
            loadChildren: () =>
                import('../address/address.routes')
                .then(m => m.addressRoutes)
        },

        {
            path: 'profile',
            loadChildren: () =>
                import('../profile/profile.routes')
                .then(m => m.profileRoutes)
        },

        {
            path: 'notifications',
            loadComponent: () =>
            import('../notification/pages/notifications-page/notifications-page.component')
                .then(m => m.NotificationsPageComponent)
        }



        /* // Checkout
        {
            path: 'checkout',
            loadChildren: () =>
            import('../checkout/checkout.routes')
                .then(m => m.checkoutRoutes)
        },*/
        
        ]
    }
];
