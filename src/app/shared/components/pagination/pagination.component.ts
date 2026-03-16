import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {

  @Input() currentPage!: number;
  @Input() totalPages!: number;
  @Input() pages: number[] = [];

  @Output() pageChange = new EventEmitter<number>();

  prev() {
    if (this.currentPage > 0) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  next() {
    if (this.currentPage < this.totalPages - 1) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  go(page: number) {
    this.pageChange.emit(page);
  }

}