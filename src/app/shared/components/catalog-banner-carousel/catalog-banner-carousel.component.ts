import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

import { CatalogBanner } from '../../../features/product/models/catalog-home.model';

@Component({
  selector: 'app-catalog-banner-carousel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-banner-carousel.component.html'
})
export class CatalogBannerCarouselComponent implements OnChanges, OnDestroy {
  @Input() banners: CatalogBanner[] = [];

  currentIndex = 0;
  private autoRotateTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private router: Router) {}

  get currentBanner(): CatalogBanner | null {
    return this.banners[this.currentIndex] ?? null;
  }

  get hasMultipleBanners(): boolean {
    return this.banners.length > 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['banners']) {
      if (this.currentIndex >= this.banners.length) {
        this.currentIndex = 0;
      }

      this.restartAutoRotate();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoRotate();
  }

  next(): void {
    if (!this.hasMultipleBanners) return;
    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    this.restartAutoRotate();
  }

  previous(): void {
    if (!this.hasMultipleBanners) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.banners.length) % this.banners.length;
    this.restartAutoRotate();
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.restartAutoRotate();
  }

  openCta(): void {
    const url = this.currentBanner?.ctaUrl?.trim();
    if (!url) return;

    if (this.isExternalUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    this.router.navigateByUrl(url);
  }

  private restartAutoRotate(): void {
    this.stopAutoRotate();

    if (!this.hasMultipleBanners) {
      return;
    }

    this.autoRotateTimer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    }, 5000);
  }

  private stopAutoRotate(): void {
    if (this.autoRotateTimer) {
      clearInterval(this.autoRotateTimer);
      this.autoRotateTimer = null;
    }
  }

  private isExternalUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
  }
}
