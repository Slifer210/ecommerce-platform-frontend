import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthState } from '../../../../core/auth/auth.state';
import { AppModalComponent } from '../../../../shared/components/app-modal/app-modal.component';
import { AssistantService } from '../../services/assistant.service';
import {
  AssistantConversationMessage,
  AssistantReplyViewModel
} from '../../models/assistant.models';
import {
  ASSISTANT_EMPTY_SUGGESTIONS,
  assistantOrderStatusLabel,
  assistantOrderStatusTone,
  normalizeAssistantReply
} from '../../utils/assistant-presenters';

@Component({
  selector: 'app-assistant-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, AppModalComponent],
  templateUrl: './assistant-widget.component.html',
  styleUrls: ['./assistant-widget.component.css']
})
export class AssistantWidgetComponent {
  @ViewChild('messageInput') private messageInput?: ElementRef<HTMLTextAreaElement>;

  readonly open = signal(false);
  readonly message = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly conversation = signal<AssistantConversationMessage[]>([]);
  readonly suggestions = ASSISTANT_EMPTY_SUGGESTIONS;
  readonly modalWidth = 'min(960px, calc(100vw - 1.5rem))';

  readonly isAuthenticated = computed(() => this.authState.isAuthenticated());
  readonly canSend = computed(() =>
    this.isAuthenticated() &&
    !this.loading() &&
    this.message().trim().length > 0
  );

  private sequence = 0;

  constructor(
    private assistantService: AssistantService,
    private authState: AuthState,
    private router: Router
  ) {}

  openAssistant(): void {
    this.open.set(true);
    this.errorMessage.set(null);

    setTimeout(() => {
      this.messageInput?.nativeElement.focus();
    });
  }

  closeAssistant(): void {
    this.open.set(false);
    this.errorMessage.set(null);
  }

  sendMessage(prefill?: string): void {
    const text = (prefill ?? this.message()).trim();

    if (!text || this.loading()) {
      return;
    }

    if (!this.isAuthenticated()) {
      this.errorMessage.set('Debes iniciar sesion para usar el asistente.');
      return;
    }

    this.errorMessage.set(null);
    this.appendUserMessage(text);
    this.message.set('');
    this.loading.set(true);

    this.assistantService
      .chat(text)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: reply => {
          this.appendAssistantReply(normalizeAssistantReply(reply));
        },
        error: error => {
          const message = error?.status === 401
            ? 'Tu sesion expiro. Inicia sesion nuevamente para continuar.'
            : 'No pude consultar el asistente en este momento. Intentalo otra vez.';

          this.errorMessage.set(message);
          this.appendAssistantReply({
            intent: 'UNKNOWN',
            message,
            readOnly: true,
            order: null,
            orders: [],
            products: [],
            knowledge: null,
            hints: []
          });
        }
      });
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  goToLogin(): void {
    this.closeAssistant();
    this.router.navigate(['/auth/login']);
  }

  goToProduct(productId: string): void {
    this.closeAssistant();
    this.router.navigate(['/products', productId]);
  }

  goToOrder(orderId: string): void {
    this.closeAssistant();
    this.router.navigate(['/my-orders', orderId]);
  }

  trackByMessage(_: number, item: AssistantConversationMessage): string {
    return item.id;
  }

  statusLabel(status: string): string {
    return assistantOrderStatusLabel(status);
  }

  statusTone(status: string): string {
    return assistantOrderStatusTone(status);
  }

  private appendUserMessage(text: string): void {
    this.conversation.update(messages => [
      ...messages,
      {
        id: this.nextId(),
        role: 'user',
        text,
        createdAt: new Date().toISOString()
      }
    ]);
  }

  private appendAssistantReply(reply: AssistantReplyViewModel): void {
    this.conversation.update(messages => [
      ...messages,
      {
        id: this.nextId(),
        role: 'assistant',
        text: reply.message,
        createdAt: new Date().toISOString(),
        reply
      }
    ]);
  }

  private nextId(): string {
    this.sequence += 1;
    return `assistant-message-${this.sequence}`;
  }
}
