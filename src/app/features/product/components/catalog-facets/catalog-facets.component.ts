import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttributeFacet } from '../../models/catalog-facets.response';

@Component({
  selector: 'app-catalog-facets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './catalog-facets.component.html'
})
export class CatalogFacetsComponent {

  @Input() facetAttributes: AttributeFacet[] = [];

  @Input() selectedAttributes = new Map<string, string[]>();

  @Output() attributeToggle =
    new EventEmitter<{ name: string; value: string }>();

  isChecked(name: string, value: string): boolean {
    const key = name.trim().toLowerCase();
    const val = value.trim().toLowerCase();
    return this.selectedAttributes.get(key)?.includes(val) ?? false;
  }

  onToggle(name: string, value: string): void {
    this.attributeToggle.emit({ name, value });
  }
}
