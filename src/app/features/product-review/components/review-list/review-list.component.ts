import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductReview } from '../../models/product-review.model';
import { ReviewVoteComponent } from '../review-vote/review-vote.component';
import { ProductReviewService } from '../../services/product-review.service';
import { RatingStarsComponent } from "../rating-stars/rating-stars.component";
import { ReviewSummaryComponent } from "../review-summary/review-summary.component";

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [CommonModule, ReviewVoteComponent, RatingStarsComponent, ReviewSummaryComponent],
  templateUrl: './review-list.component.html',
})
export class ReviewListComponent implements OnInit {

  @Input() productId!: string;

  reviews: ProductReview[] = [];
  page = 0;
  totalPages = 0;

  constructor(private reviewService: ProductReviewService) {}

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.reviewService.listReviews(this.productId, this.page)
      .subscribe(res => {
        this.reviews = res.content.map((review: any) => ({
          ...review,
          votedHelpful: review.myVote
        }));

        this.totalPages = res.totalPages;
      });
  }

  nextPage() {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.loadReviews();
    }
  }
}
