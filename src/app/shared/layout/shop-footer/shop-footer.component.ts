import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

import { Category } from '../../../features/product/models/category.model';

@Component({
  selector: 'app-shop-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shop-footer.component.html'
})
export class ShopFooterComponent {
  @Input() categories: Category[] = [];

  readonly currentYear = new Date().getFullYear();

  get featuredCategories(): Category[] {
    const rootCategories = this.categories.filter(category => !category.parentId);
    return rootCategories.length ? rootCategories : this.categories;
  }
}
