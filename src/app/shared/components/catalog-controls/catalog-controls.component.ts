import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-catalog-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-controls.component.html'
})
export class CatalogControlsComponent {

  @Input() loading = false;

  @Input() showingFrom!: number;
  @Input() showingTo!: number;
  @Input() total!: number;

  @Input() sortKey!: string;
  @Input() pageSize!: number;

  @Output() sortChange = new EventEmitter<string>();
  @Output() pageSizeChange = new EventEmitter<number>();

}