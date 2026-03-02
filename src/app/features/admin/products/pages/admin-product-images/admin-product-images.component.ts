import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AdminProductImageService } from '../../services/admin-product-image.service';
import { ProductImage } from '../../models/product-image.model';

@Component({
  selector: 'app-admin-product-images',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-product-images.component.html'
})
export class AdminProductImagesComponent implements OnInit {

  @Input() productId!: string;

  images: ProductImage[] = [];
  loading = false;

  private cloudName = 'dv7jhcs8z';
  private uploadPreset = 'ecommerce';

  constructor(
    private http: HttpClient,
    private imageService: AdminProductImageService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.imageService
      .list(this.productId)
      .subscribe(imgs => this.images = imgs);
  }

  upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    this.loading = true;

    this.http.post<any>(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
      formData
    ).subscribe({
      next: res => {
        this.imageService
          .add(this.productId, res.secure_url)
          .subscribe(() => {
            this.load();
            this.loading = false;
          });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  remove(imageId: string): void {
    this.imageService
      .remove(this.productId, imageId)
      .subscribe(() => this.load());
  }

  setMain(imageId: string): void {
    this.imageService
      .setMain(this.productId, imageId)
      .subscribe(() => this.load());
  }
}
