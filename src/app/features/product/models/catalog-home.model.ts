import { CatalogProduct } from './catalog-product.model';

export interface CatalogBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  imageUrlMobile: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

export interface CatalogHomeHero {
  title: string;
  subtitle: string;
}

export interface CatalogQuickCategory {
  id: string;
  name: string;
}

export interface CatalogHomeResponse {
  hero: CatalogHomeHero | null;
  banners: CatalogBanner[];
  quickCategories: CatalogQuickCategory[];
  trending: CatalogProduct[];
  bestSellers: CatalogProduct[];
  newProducts: CatalogProduct[];
  topRated: CatalogProduct[];
}
