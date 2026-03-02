import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ProductReviewService } from '../../services/product-review.service';
import { CLOUDINARY_CONFIG } from '../../../../core/config/cloudinary.config';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-form.component.html',
})
export class ReviewFormComponent {

  @Input() productId!: string;
  @Input() orderItemId!: string;

  rating = 5;
  comment = '';

  images: string[] = [];
  uploading = false;

  private cloudinary = CLOUDINARY_CONFIG;

  constructor(
    private reviewService: ProductReviewService,
    private http: HttpClient
  ) {}

  uploadImage(event: Event): void {

    const input = event.target as HTMLInputElement;

    if (!input.files?.length) return;
    if (this.images.length >= 3) return;

    const file = input.files[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.cloudinary.uploadPreset);

    this.uploading = true;

    this.http.post<any>(
      this.cloudinary.uploadUrl,
      formData
    ).subscribe({
      next: res => {
        this.images.push(res.secure_url);
        this.uploading = false;
        input.value = '';
      },
      error: () => {
        this.uploading = false;
      }
    });
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
  }

  submit(): void {
    this.reviewService.createReview(this.productId, {
      orderItemId: this.orderItemId,
      rating: this.rating,
      comment: this.comment,
      imageUrls: this.images
    }).subscribe(() => {
      this.comment = '';
      this.rating = 5;
      this.images = [];
    });
  }
}