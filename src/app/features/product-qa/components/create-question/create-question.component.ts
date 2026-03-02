import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductQaService } from '../../services/product-qa.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-question',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-question.component.html'
})
export class CreateQuestionComponent {
  @Input() productId!: string;
  @Output() created = new EventEmitter<void>();

  question = '';

  constructor(private qaService: ProductQaService) {}

  submit() {
    if (!this.question.trim()) return;

    this.qaService.createQuestion(this.productId, this.question)
      .subscribe(() => {
        this.question = '';
        this.created.emit();
      });
  }
}
