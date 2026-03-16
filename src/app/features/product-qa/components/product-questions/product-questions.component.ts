import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductQaService } from '../../services/product-qa.service';
import { ProductQuestion } from '../../models/product-qa.model';

import { CreateQuestionComponent } from '../create-question/create-question.component';
import { CreateAnswerComponent } from '../create-answer/create-answer.component';

import { AuthState } from '../../../../core/auth/auth.state';
import { ScrollLockService } from '../../../../core/services/scroll-lock.service';
import { AppModalComponent } from '../../../../shared/components/app-modal/app-modal.component';

@Component({
  selector: 'app-product-questions',
  standalone: true,
  imports: [
    CommonModule,
    CreateQuestionComponent,
    CreateAnswerComponent,
    AppModalComponent
  ],
  templateUrl: './product-questions.component.html'
})
export class ProductQuestionsComponent implements OnInit, OnDestroy {

  @Input() productId!: string;

  showQuestionsModal = false;

  questions: ProductQuestion[] = [];

  constructor(
    private qaService: ProductQaService,
    public authState: AuthState,
    private scrollLock: ScrollLockService
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  ngOnDestroy(): void {
    this.scrollLock.unlock();
  }

  loadQuestions(): void {

    this.qaService
      .getQuestions(this.productId)
      .subscribe(res => {

        this.questions = res.content;

      });

  }

  openModal(): void {

    this.showQuestionsModal = true;
    this.scrollLock.lock();

  }

  closeModal(): void {

    this.showQuestionsModal = false;
    this.scrollLock.unlock();

  }

  isMyQuestion(q: ProductQuestion): boolean {

    return q.authorId === this.authState.user()?.id;

  }

}