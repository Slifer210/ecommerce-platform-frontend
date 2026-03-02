import { CatalogProduct } from "./catalog-product.model";


export interface CategoryFacet {
    id: string;
    name: string;
    count: number;
}

export interface BrandFacet {
    name: string;
    count: number;
}

export interface AttributeValueFacet {
    value: string;
    count: number;
}

export interface AttributeFacet {
    name: string;
    values: AttributeValueFacet[];
}

export interface PriceRangeFacet {
    from: number;
    to: number | null;
    count: number;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}


export interface CatalogFacetsResponse {
    categories: CategoryFacet[];
    brands: BrandFacet[];
    attributes: AttributeFacet[];
    priceRanges: PriceRangeFacet[];
}

export interface CatalogPageResponse {
    page: PageResponse<CatalogProduct>;
    facets: CatalogFacetsResponse;
}