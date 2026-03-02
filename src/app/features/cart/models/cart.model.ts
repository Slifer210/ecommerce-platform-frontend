import { CartItem } from './cart-item.model';

export interface Cart {
    id: string;
    status: string;
    totalAmount: number;
    items: CartItem[];
}
