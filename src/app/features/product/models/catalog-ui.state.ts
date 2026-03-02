import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CatalogUiState {

  /** categoría seleccionada (temporal) */
  readonly tempCategoryId = signal<string | null>(null);

  /** categorías expandidas */
  readonly expandedCategories = signal<Set<string>>(new Set());

  toggleCategory(id: string): void {
    const set = new Set(this.expandedCategories());
    set.has(id) ? set.delete(id) : set.add(id);
    this.expandedCategories.set(set);
  }

  isExpanded(id: string): boolean {
    return this.expandedCategories().has(id);
  }

  reset(): void {
    this.tempCategoryId.set(null);
    this.expandedCategories.set(new Set());
  }
}
