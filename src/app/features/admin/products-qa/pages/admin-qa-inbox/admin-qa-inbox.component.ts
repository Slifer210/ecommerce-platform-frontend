import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminQaService } from '../../services/admin-qa.service';
import { AdminQuestion } from '../../models/admin-qa.model';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-qa-inbox',
  templateUrl: './admin-qa-inbox.component.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule 
  ]
})
export class AdminQaInboxComponent implements OnInit {

  questions: AdminQuestion[] = [];
  loading = false;
  search = ''; 

  constructor(private qaService: AdminQaService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.qaService.getUnanswered().subscribe(res => {
      this.questions = res.content;
      this.loading = false;
    });
  }

  answer(questionId: string, answer: string): void {
    if (!answer.trim()) return;

    this.qaService.answer(questionId, answer).subscribe(() => {
      this.load();
    });
  }

  get filteredQuestions(): AdminQuestion[] {
    const term = this.search.toLowerCase().trim();

    if (!term) return this.questions;

    return this.questions.filter(q =>
      q.question.toLowerCase().includes(term) ||
      q.productName.toLowerCase().includes(term)
    );
  }
}
