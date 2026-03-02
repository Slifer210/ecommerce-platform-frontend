import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceRangeFacet } from '../../models/catalog-facets.response';

@Component({
  selector: 'app-catalog-price-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-price-filter.component.html'
})
export class CatalogPriceFilterComponent {

  @Input() priceRanges: PriceRangeFacet[] = [];

  // ✅ ESTADO REAL (viene del CatalogComponent)
  @Input() minPrice: number | null = null;
  @Input() maxPrice: number | null = null;

  @Output() select =
    new EventEmitter<{ min: number | null; max: number | null }>();

  @Output() clear =
    new EventEmitter<void>();

  onSelectRange(min: number | null, max: number | null): void {
    this.select.emit({ min, max });
  }

  onMinChange(value: number | null): void {
    this.select.emit({ min: value, max: this.maxPrice });
  }

  onMaxChange(value: number | null): void {
    this.select.emit({ min: this.minPrice, max: value });
  }

  isRangeActive(min: number | null, max: number | null): boolean {
    return this.minPrice === min && this.maxPrice === max;
  }

  clearPrice(): void {
    this.clear.emit();
  }
}
