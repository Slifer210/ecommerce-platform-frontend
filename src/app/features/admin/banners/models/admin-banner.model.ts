export interface AdminBanner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  imageUrlMobile: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
  currentlyVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBannerRequest {
  title: string;
  subtitle: string | null;
  imageUrl: string;
  imageUrlMobile: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
}

export interface BannerReorderRequest {
  bannerIds: string[];
}
