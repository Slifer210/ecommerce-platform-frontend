export interface CreateReviewRequest {
    orderItemId: string;
    rating: number;
    comment: string;
    imageUrls?: string[];
}
