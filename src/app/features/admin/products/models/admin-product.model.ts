import { Category } from './category.model';

export interface ProductAttribute {
    name: string;
    value: string;
    group: 'PRINCIPAL' | 'OTHER';
}

export interface AdminProduct {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    active: boolean;
    mainImageUrl?: string | null;
    categories: Category[];
    attributes?: ProductAttribute[];
}
