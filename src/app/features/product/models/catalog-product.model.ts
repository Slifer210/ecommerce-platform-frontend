export interface CatalogProduct {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    mainImageUrl?: string | null;
    categories: {
        id: string;
        name: string;
    }[];
    attributes?: {
        principales: {
        name: string;
        value: string;
        }[];
        otros: {
        name: string;
        value: string;
        }[];
    };
}
