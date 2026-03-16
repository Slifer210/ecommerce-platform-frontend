import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductReview } from '../../models/product-review.model';
import { ProductReviewService } from '../../services/product-review.service';

import { ReviewVoteComponent } from '../review-vote/review-vote.component';
import { RatingStarsComponent } from "../rating-stars/rating-stars.component";
import { ReviewSummaryComponent } from '../review-summary/review-summary.component';

import { ScrollLockService } from '../../../../core/services/scroll-lock.service';
import { AppModalComponent } from '../../../../shared/components/app-modal/app-modal.component';

@Component({
  selector: 'app-review-list',
  standalone: true,
  imports: [
    CommonModule,
    ReviewVoteComponent,
    RatingStarsComponent,
    ReviewSummaryComponent,
    AppModalComponent
  ],
  templateUrl: './review-list.component.html',
})
export class ReviewListComponent implements OnInit, OnDestroy {

  @Input() productId!: string;

  // Reviews visibles en la página
  pageReviews: ProductReview[] = [];

  // Reviews del modal (paginadas)
  modalReviews: ProductReview[] = [];

  page = 0;
  totalPages = 0;

  showModal = false;

  constructor(
    private reviewService: ProductReviewService,
    private scrollLock: ScrollLockService
  ) {}

  ngOnInit() {
    this.loadPageReviews();
  }

  ngOnDestroy(): void {
    this.scrollLock.unlock();
  }

  // =============================
  // REVIEWS DE LA PÁGINA
  // =============================

  loadPageReviews() {

    this.reviewService
      .listReviews(this.productId, 0)
      .subscribe(res => {

        this.pageReviews = res.content.map((review: any) => ({
          ...review,
          votedHelpful: review.myVote
        }));

      });

  }

  // =============================
  // ABRIR MODAL
  // =============================

  openModal() {

    this.showModal = true;
    this.scrollLock.lock();

    this.page = 0;
    this.modalReviews = [];

    this.loadModalReviews();

  }

  closeModal() {

    this.showModal = false;
    this.scrollLock.unlock();

  }

  // =============================
  // REVIEWS DEL MODAL
  // =============================

  loadModalReviews() {

    this.reviewService
      .listReviews(this.productId, this.page)
      .subscribe(res => {

        const mapped = res.content.map((review: any) => ({
          ...review,
          votedHelpful: review.myVote
        }));

        this.modalReviews = [...this.modalReviews, ...mapped];

        this.totalPages = res.totalPages;

      });

  }

  nextPage() {

    if (this.page + 1 < this.totalPages) {

      this.page++;
      this.loadModalReviews();

    }

  }

}