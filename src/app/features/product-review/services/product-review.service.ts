import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductReview } from '../models/product-review.model';
import { CreateReviewRequest } from '../models/create-review.request';
import { ReviewVoteRequest } from '../models/review-vote.request';
import { ReviewVoteResponse } from '../models/ReviewVoteResponse';
import { ProductReviewSummary } from '../models/product-review-summary.model';

@Injectable({ providedIn: 'root' })
export class ProductReviewService {

    private baseUrl = '/api';

    constructor(private http: HttpClient) {}

    listReviews(
        productId: string,
        page = 0,
        size = 10,
        sort = 'createdAt,desc'
    ): Observable<any> {
        const params = new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('sort', sort);

        return this.http.get<any>(
        `${this.baseUrl}/products/${productId}/reviews`,
        { params }
        );
    }

    createReview(productId: string, request: CreateReviewRequest): Observable<void> {
        return this.http.post<void>(
        `${this.baseUrl}/products/${productId}/reviews`,
        request
        );
    }

    voteReview(reviewId: string, helpful: boolean): Observable<ReviewVoteResponse> {
        const body: ReviewVoteRequest = { helpful };

        return this.http.post<ReviewVoteResponse>(
            `${this.baseUrl}/reviews/${reviewId}/vote`,
            body
        );
    }


    getReviewSummary(productId: string): Observable<ProductReviewSummary> {
        return this.http.get<ProductReviewSummary>(
            `${this.baseUrl}/products/${productId}/reviews/summary`
        );
    }

}
