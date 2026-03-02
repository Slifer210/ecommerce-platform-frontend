import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CatalogState } from '../../models/catalog.state';
import { Category } from '../../models/category.model';
import { AttributeFacet, PriceRangeFacet } from '../../models/catalog-facets.response';

import { CatalogCategoriesComponent } from '../catalog-categories/catalog-categories.component';
import { CatalogPriceFilterComponent } from '../catalog-price-filter/catalog-price-filter.component';
import { CatalogFacetsComponent } from '../catalog-facets/catalog-facets.component';

@Component({
  selector: 'app-catalog-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    CatalogCategoriesComponent,
    CatalogPriceFilterComponent,
    CatalogFacetsComponent
  ],
  templateUrl: './catalog-sidebar.component.html'
})
export class CatalogSidebarComponent {

  /** Categorías */
  @Input() rootCategories!: Category[];
  @Input() categoryTree!: Map<string | null, Category[]>;
  @Input() facetCount!: (categoryId: string) => number;

  /** Facets */
  @Input() facetAttributes!: AttributeFacet[];
  @Input() facetPriceRanges!: PriceRangeFacet[];

  // ✅ ESTADO REAL DE LOS CHECKBOXES
  @Input() selectedAttributes = new Map<string, string[]>();

  // ✅ ESTADO REAL DEL PRECIO (VIENE DEL CatalogComponent)
  @Input() minPrice: number | null = null;
  @Input() maxPrice: number | null = null;

  /** Eventos */
  @Output() clear = new EventEmitter<void>();
  @Output() categorySelect = new EventEmitter<string | null>();
  @Output() attributeToggle =
    new EventEmitter<{ name: string; value: string }>();
  @Output() priceSelect =
    new EventEmitter<{ min: number | null; max: number | null }>();

  constructor(
    public catalogState: CatalogState
  ) {}

  emitAttribute(event: { name: string; value: string }): void {
    this.attributeToggle.emit(event);
  }
}
