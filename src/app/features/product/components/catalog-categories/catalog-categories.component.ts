import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';

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
export class CatalogCategoriesComponent implements OnChanges {

  @Input() activeCategoryId!: string | null;

  /** categorías raíz */
  @Input({ required: true }) rootCategories!: Category[];

  /** árbol de categorías */
  @Input({ required: true }) categoryTree!: Map<string | null, Category[]>;

  /** facets (opcional, solo post-búsqueda) */
  @Input() facetCount?: (id: string) => number;

  /** EVENTO REAL */
  @Output() categorySelect = new EventEmitter<string | null>();

  constructor(
    public ui: CatalogUiState,
    public catalogState: CatalogState
  ) {}

  ngOnChanges(changes: SimpleChanges): void {

    if (changes['activeCategoryId']) {

      const id = this.activeCategoryId;

      if (!id) return;

      // expandir categoría seleccionada
      this.ui.expandCategory(id);

      // expandir padre si existe
      for (const [parentId, children] of this.categoryTree.entries()) {

        if (children.some(c => c.id === id)) {

          if (parentId) {
            this.ui.expandCategory(parentId);
          }

        }

      }

    }

  }

  selectCategory(id: string | null): void {
    this.ui.tempCategoryId.set(id);   // UI
    this.categorySelect.emit(id);     // FILTRO REAL
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