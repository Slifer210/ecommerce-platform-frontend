export interface ProductQuestion {
    id: string;
    question: string;

    authorId: string;
    authorName: string;
    authorRole: 'ADMIN' | 'CUSTOMER';

    createdAt: string;

    productId: string;
    productName: string;

    answers: ProductAnswer[];
}


export interface ProductAnswer {
    id: string;
    answer: string;
    seller: boolean;
    createdAt: string;
}
