import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { AuthState } from '../../../core/auth/auth.state';
import { CatalogState } from '../../product/models/catalog.state';
import { CategoryService } from '../../product/services/category.service';
import { Category } from '../../product/models/category.model';

import { ShopHeaderCustomerActionsComponent } from '../header-actions/shop-header-customer-actions/shop-header-customer-actions.component';
import { ShopHeaderAdminActionsComponent } from '../header-actions/shop-header-admin-actions/shop-header-admin-actions.component';
import { HeaderBaseComponent } from '../../../shared/layout/header-base/header-base.component';

@Component({
  selector: 'app-shop-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderBaseComponent,
    ShopHeaderCustomerActionsComponent,
    ShopHeaderAdminActionsComponent
  ],
  templateUrl: './shop-layout.component.html'
})
export class ShopLayoutComponent implements OnInit {

  showCategories = false;
  activeCategory: Category | null = null;

  categories: Category[] = [];
  categoryTree = new Map<string | null, Category[]>();

  constructor(
    public authState: AuthState,
    public catalogState: CatalogState,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe(categories => {
      this.categories = categories;

      const map = new Map<string | null, Category[]>();
      for (const c of categories) {
        const key = c.parentId ?? null;
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(c);
      }

      this.categoryTree = map;
    });
  }

  toggleCategories(): void {
    this.showCategories = !this.showCategories;
    if (!this.showCategories) {
      this.activeCategory = null;
    }
  }

  closeCategories(): void {
    this.showCategories = false;
    this.activeCategory = null;
  }

  selectCategory(cat: Category): void {
    this.closeCategories();
    this.router.navigate(['/products'], {
      queryParams: { category: cat.id }
    });
  }

  goToCategory(categoryId: string): void {
    this.closeCategories();
    this.router.navigate(['/products'], {
      queryParams: { category: categoryId }
    });
  }



  applySearch(): void {
    this.closeCategories();

    const q = this.catalogState.searchDraft().trim();
    if (!q) return;

    this.router.navigate(['/products'], {
      queryParams: { q },
      replaceUrl: true
    });
  }




}
