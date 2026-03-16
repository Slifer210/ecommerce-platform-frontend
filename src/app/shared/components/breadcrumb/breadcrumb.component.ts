import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface BreadcrumbItem {
  id?: string | number;
  name: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent {

  @Input() items: BreadcrumbItem[] = [];

  @Output() homeClick = new EventEmitter<void>();
  @Output() categoryClick = new EventEmitter<string | number>();

}