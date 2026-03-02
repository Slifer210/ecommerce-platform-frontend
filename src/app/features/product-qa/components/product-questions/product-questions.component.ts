import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductQaService } from '../../services/product-qa.service';
import { ProductQuestion } from '../../models/product-qa.model';


import { CreateQuestionComponent } from '../create-question/create-question.component';
import { CreateAnswerComponent } from '../create-answer/create-answer.component';
import { AuthState } from '../../../../core/auth/auth.state';

@Component({
  selector: 'app-product-questions',
  standalone: true,
  imports: [
    CommonModule,
    CreateQuestionComponent,
    CreateAnswerComponent
  ],
  templateUrl: './product-questions.component.html'
})
export class ProductQuestionsComponent implements OnInit {

  @Input() productId!: string;

  questions: ProductQuestion[] = [];

  constructor(
    private qaService: ProductQaService,
    public authState: AuthState
  ) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.qaService.getQuestions(this.productId).subscribe(res => {
      this.questions = res.content;
    });
  }

  isMyQuestion(q: ProductQuestion): boolean {
    return q.authorId === this.authState.user()?.id;
  }
}
