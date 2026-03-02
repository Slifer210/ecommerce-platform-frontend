import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CatalogState } from '../../models/catalog.state';
import { Category } from '../../models/category.model';
import { CatalogUiState } from '../../models/catalog-ui.state';

@Component({
  selector: 'app-catalog-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-categories.component.html'
})
export class CatalogCategoriesComponent {

  /** categorías raíz */
  @Input({ required: true }) rootCategories!: Category[];

  /** árbol de categorías */
  @Input({ required: true }) categoryTree!: Map<string | null, Category[]>;

  /** facets (opcional, solo post-búsqueda) */
  @Input() facetCount?: (id: string) => number;

  /** 🔥 EVENTO REAL */
  @Output() categorySelect = new EventEmitter<string | null>();

  constructor(
    public ui: CatalogUiState,
    public catalogState: CatalogState
  ) {}

  selectCategory(id: string | null): void {
    this.ui.tempCategoryId.set(id);      // UI
    this.categorySelect.emit(id);        // 🔥 FILTRO REAL
  }

  toggleCategory(id: string): void {
    this.ui.toggleCategory(id);
  }

  isExpanded(id: string): boolean {
    return this.ui.isExpanded(id);
  }

  getFacetCount(id: string): number {
    return this.facetCount ? this.facetCount(id) : 0;
  }
}
