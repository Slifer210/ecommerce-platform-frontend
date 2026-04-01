import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

import {
  AssistantReply
} from '../models/assistant.models';
import {
  buildAssistantChatRequest,
  coerceAssistantReply
} from '../utils/assistant-presenters';

@Injectable({
  providedIn: 'root'
})
export class AssistantService {
  private readonly apiUrl = `${environment.assistantApiUrl.replace(/\/+$/, '')}/assistant/chat`;

  constructor(private http: HttpClient) {}

  chat(question: string): Observable<AssistantReply> {
    return this.http.post<unknown>(
      this.apiUrl,
      buildAssistantChatRequest(question)
    ).pipe(
      map(response => coerceAssistantReply(response))
    );
  }
}
