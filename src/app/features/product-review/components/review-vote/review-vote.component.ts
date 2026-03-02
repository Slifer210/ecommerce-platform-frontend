import { Component, Input } from '@angular/core';
import { ProductReview } from '../../models/product-review.model';
import { ProductReviewService } from '../../services/product-review.service';

@Component({
  selector: 'app-review-vote',
  standalone: true,
  templateUrl: './review-vote.component.html',
})
export class ReviewVoteComponent {

  @Input() review!: ProductReview;

  constructor(private reviewService: ProductReviewService) {}

  toggleVote(): void {

    const current = this.review.votedHelpful === true;
    const newValue = !current;

    this.reviewService.voteReview(this.review.id, newValue)
      .subscribe({
        next: (response) => {
          this.review.votedHelpful = response.votedHelpful;
          this.review.helpfulCount = response.helpfulCount;
        },
        error: (err) => {
          console.error('Error voting review', err);
        }
      });
  }
}
