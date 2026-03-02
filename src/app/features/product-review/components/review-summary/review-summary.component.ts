import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductReviewService } from '../../services/product-review.service';
import { ProductReviewSummary } from '../../models/product-review-summary.model';
import { RatingStarsComponent } from '../rating-stars/rating-stars.component';

@Component({
  selector: 'app-review-summary',
  standalone: true,
  imports: [CommonModule, RatingStarsComponent],
  templateUrl: './review-summary.component.html'
})
export class ReviewSummaryComponent implements OnInit {

  @Input() productId!: string;

  summary?: ProductReviewSummary;

  constructor(private reviewService: ProductReviewService) {}

  ngOnInit() {
    this.reviewService.getReviewSummary(this.productId)
      .subscribe(res => {
        this.summary = res;
      });
  }
  
  percentage(stars: number): number {
    if (!this.summary || this.summary.totalReviews === 0) {
      return 0;
    }

    const map: Record<number, number> = {
      1: this.summary.oneStar,
      2: this.summary.twoStars,
      3: this.summary.threeStars,
      4: this.summary.fourStars,
      5: this.summary.fiveStars,
    };

    const count = map[stars] ?? 0;

    return Math.round((count / this.summary.totalReviews) * 100);
  }
}
