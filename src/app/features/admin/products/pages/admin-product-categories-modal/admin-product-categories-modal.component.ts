import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../models/category.model';
import { AdminCategoryService } from '../../services/admin-category.service';
import { AdminProductCategoryService } from '../../services/admin-product-category.service';

@Component({
  selector: 'app-admin-product-categories-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-product-categories-modal.component.html'
})
export class AdminProductCategoriesModalComponent implements OnInit {

  @Input() productId!: string;
  @Output() close = new EventEmitter<void>();

  categories: Category[] = [];
  selected = new Set<string>();
  loading = false;

  constructor(
    private categoryService: AdminCategoryService,
    private productCategoryService: AdminProductCategoryService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;

    this.categoryService.getAll().subscribe(all => {
      this.categories = all;

      this.productCategoryService
        .getByProduct(this.productId)
        .subscribe(productCategories => {
          this.selected.clear();
          productCategories.forEach(c => this.selected.add(c.id));
          this.loading = false;
        });
    });
  }

  toggle(categoryId: string, checked: boolean): void {
    if (checked) {
      this.productCategoryService
        .add(this.productId, categoryId)
        .subscribe(() => this.selected.add(categoryId));
    } else {
      this.productCategoryService
        .remove(this.productId, categoryId)
        .subscribe(() => this.selected.delete(categoryId));
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  // =========================
  // HELPERS DE JERARQUÍA
  // =========================

  get parentCategories(): Category[] {
    return this.categories.filter(c => !c.parentId);
  }

  getChildren(parentId: string): Category[] {
    return this.categories.filter(c => c.parentId === parentId);
  }
}
