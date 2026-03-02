
export interface ReviewImage {
    id: string;
    imageUrl: string;
}

export interface ProductReview {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    helpfulCount: number;
    createdAt: string;
    votedHelpful: boolean;
    images?: ReviewImage[];
}
