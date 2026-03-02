import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CatalogState {

  // Texto del input (header)
  readonly searchDraft = signal<string>('');

  // Query efectiva (desde URL)
  readonly searchApplied = signal<string | null>(null);

  // Modo búsqueda
  readonly searchMode = signal<boolean>(false);

  readonly categoryApplied = signal<string | null>(null);

  setCategoryFromUrl(categoryId: string | null): void {
    this.categoryApplied.set(categoryId);
  }

  clearCategory(): void {
    this.categoryApplied.set(null);
  }

  readonly hasActiveFilters = computed(() => {
    const value = !!(
      this.searchApplied() ||
      this.categoryApplied()
    );
    console.log('[hasActiveFilters computed]', {
      search: this.searchApplied(),
      category: this.categoryApplied(),
      value
    });
    return value;
  });



  // ===== HEADER =====

  setDraft(value: string): void {
    this.searchDraft.set(value);
  }

  clearSearch(): void {
    this.searchDraft.set('');
    this.searchApplied.set(null);
    this.searchMode.set(false);
  }

  // ===== ROUTER / PRODUCTS =====

  /**
   * Este método es la CLAVE.
   * Se llama SIEMPRE que cambia la URL (?q=)
   */
  setQueryFromUrl(query: string | null): void {
    const value = query?.trim() ?? '';

    this.searchDraft.set(value);
    this.searchApplied.set(value || null);
    this.searchMode.set(!!value);

    // ⚠️ aquí NO cargas productos
    // eso lo hace el ProductsPage o service
  }

  // ===== COMPUTED =====

  readonly isSearchActive = computed(() => this.searchMode());
}
