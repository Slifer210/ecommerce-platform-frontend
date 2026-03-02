import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AdminQuestion } from '../models/admin-qa.model';

@Injectable({ providedIn: 'root' })
export class AdminQaService {

    private api = '/api/admin/qa';

    /** Estado reactivo del badge */
    private badgeCountSubject = new BehaviorSubject<number>(0);
    badgeCount$ = this.badgeCountSubject.asObservable();

    constructor(private http: HttpClient) {}

    /** ================================
     *  PREGUNTAS SIN RESPONDER
     *  ================================ */
    getUnanswered(page = 0, size = 20): Observable<{ content: AdminQuestion[] }> {
        const params = new HttpParams()
        .set('page', page)
        .set('size', size);

        return this.http.get<{ content: AdminQuestion[] }>(
        `${this.api}/questions/unanswered`,
        { params }
        );
    }

    /** ================================
     *  RESPONDER PREGUNTA
     *  ================================ */
    answer(questionId: string, answer: string): Observable<void> {
        return this.http.post<void>(
        `/api/questions/${questionId}/answers`,
        { answer }
        ).pipe(
        // cuando se responde → refrescamos badge
        tap(() => this.refreshBadgeCount())
        );
    }

    /** ================================
     *  CONTADOR (HTTP)
     *  ================================ */
    countUnanswered(): Observable<number> {
        return this.http.get<number>(
        `${this.api}/questions/unanswered/count`
        );
    }

    /** ================================
     *  REFRESH DEL BADGE
     *  ================================ */
    refreshBadgeCount(): void {
        this.countUnanswered().subscribe(count => {
        this.badgeCountSubject.next(count);
        });
    }
}
