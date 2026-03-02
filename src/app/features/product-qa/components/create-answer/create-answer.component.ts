import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductQaService } from '../../services/product-qa.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-answer',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-answer.component.html'
})
export class CreateAnswerComponent {
  @Input() questionId!: string;
  @Output() created = new EventEmitter<void>();

  answer: string = '';

  constructor(private qaService: ProductQaService) {}

  submit(): void {
    if (!this.answer.trim()) return;

    this.qaService.createAnswer(this.questionId, this.answer)
      .subscribe(() => {
        this.answer = '';
        this.created.emit();
      });
  }
}
