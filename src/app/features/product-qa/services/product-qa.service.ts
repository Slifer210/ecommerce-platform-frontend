import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductQuestion } from '../models/product-qa.model';

@Injectable({ providedIn: 'root' })
export class ProductQaService {
    private api = '/api';

    constructor(private http: HttpClient) {}

    getQuestions(productId: string, page = 0, size = 10): Observable<any> {
        const params = new HttpParams()
        .set('page', page)
        .set('size', size);

        return this.http.get<any>(
        `${this.api}/products/${productId}/questions`,
        { params }
        );
    }

    createQuestion(productId: string, question: string): Observable<void> {
        return this.http.post<void>(
        `${this.api}/products/${productId}/questions`,
        { question }
        );
    }

    createAnswer(questionId: string, answer: string): Observable<void> {
        return this.http.post<void>(
        `${this.api}/questions/${questionId}/answers`,
        { answer }
        );
    }
}
