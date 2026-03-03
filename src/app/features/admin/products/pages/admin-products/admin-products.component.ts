import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminProductService } from '../../services/admin-product.service';
import { AdminCategoryService } from '../../services/admin-category.service';

import { AdminProduct } from '../../models/admin-product.model';
import { Category } from '../../models/category.model';

import { AdminProductModalComponent } from '../admin-product-modal/admin-product-modal.component';
import { AdminProductCategoriesModalComponent } from '../admin-product-categories-modal/admin-product-categories-modal.component';
import { AlertService } from '../../../../../core/services/alert.service';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminProductModalComponent,
    AdminProductCategoriesModalComponent
  ],
  templateUrl: './admin-products.component.html'
})
export class AdminProductsComponent implements OnInit {

  // =========================
  // DATA
  // =========================
  products: AdminProduct[] = [];
  filteredProducts: AdminProduct[] = [];

  /** Todas las categorías reales del sistema */
  categories: Category[] = [];

  loading = false;

  // =========================
  // FILTROS
  // =========================
  searchTerm = '';
  filterActive: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  selectedCategoryId = '';

  // =========================
  // MODALES
  // =========================
  showModal = false;
  showCategories = false;
  selectedProduct?: AdminProduct;

  constructor(
    private adminProductService: AdminProductService,
    private categoryService: AdminCategoryService,
    private alert: AlertService
  ) {}

  // =========================
  // CICLO DE VIDA
  // =========================
  ngOnInit(): void {
    this.loadProductsAndCategories();
  }

  // =========================
  // CARGA UNIFICADA
  // =========================
  loadProductsAndCategories(): void {
    this.loading = true;

    this.adminProductService.getAll().subscribe({
      next: products => {

        // Evita null
        this.products = products ?? [];

        this.categoryService.getAll().subscribe({
          next: categories => {
            this.categories = categories ?? [];
            this.applyFilters();
            this.loading = false;
          },
          error: error => {
            this.loading = false;

            if (error.status === 401) return;

            if (error.status >= 500) {
              this.alert.error('Ocurrió un error del servidor');
              return;
            }
            this.categories = [];
            this.applyFilters();
          }
        });
      },
      error: error => {
        this.loading = false;

        if (error.status === 401) return;

        if (error.status >= 500) {
          this.alert.error('Ocurrió un error del servidor');
          return;
        }
        this.products = [];
      }
    });
  }

  // =========================
  // FILTROS
  // =========================
  applyFilters(): void {
    this.filteredProducts = this.products.filter(p => {

      const matchesSearch =
        !this.searchTerm ||
        p.name.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        this.filterActive === 'ALL' ||
        (this.filterActive === 'ACTIVE' && p.active) ||
        (this.filterActive === 'INACTIVE' && !p.active);

      const matchesCategory =
        !this.selectedCategoryId ||
        p.categories?.some(c => c.id === this.selectedCategoryId);

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  onStatusChange(status: 'ALL' | 'ACTIVE' | 'INACTIVE'): void {
    this.filterActive = status;
    this.applyFilters();
  }

  // =========================
  // JERARQUÍA DE CATEGORÍAS
  // =========================

  /** Categorías padre */
  get parentCategories(): Category[] {
    return this.categories.filter(c => !c.parentId);
  }

  /** Subcategorías de un padre */
  getChildren(parentId: string): Category[] {
    return this.categories.filter(c => c.parentId === parentId);
  }

  /** Ruta jerárquica */
  getCategoryPath(category: Category): string {
    if (!category.parentId) {
      return category.name;
    }

    const parent = this.categories.find(c => c.id === category.parentId);
    return parent
      ? `${parent.name} / ${category.name}`
      : category.name;
  }

  // =========================
  // ACCIONES
  // =========================
  newProduct(): void {
    this.selectedProduct = undefined;
    this.showModal = true;
  }

  edit(product: AdminProduct): void {
    this.selectedProduct = product;
    this.showModal = true;
  }

  openCategories(product: AdminProduct): void {
    this.selectedProduct = product;
    this.showCategories = true;
  }

  save(product: Partial<AdminProduct>): void {
    const request$ = this.selectedProduct
      ? this.adminProductService.update(this.selectedProduct.id, product)
      : this.adminProductService.create(product);

    request$.subscribe({
      next: () => {
        this.alert.success(
          this.selectedProduct
            ? 'Producto actualizado correctamente'
            : 'Producto creado correctamente'
        );
        this.showModal = false;
        this.loadProductsAndCategories();
      },
      error: error => {

        if (error.status === 401) return;

        this.alert.error('No se pudo guardar el producto');
      }
    });
  }

  // =========================
  // ACTIVAR / DESACTIVAR
  // =========================
  toggleStatus(product: AdminProduct): void {
    const message = product.active
      ? '¿Desactivar este producto?'
      : '¿Activar este producto?';

    this.alert.confirm(message).then(ok => {
      if (!ok) return;

      const action$ = product.active
        ? this.adminProductService.deactivate(product.id)
        : this.adminProductService.activate(product.id);

      action$.subscribe({
        next: () => {
          this.alert.success(
            product.active
              ? 'Producto desactivado'
              : 'Producto activado'
          );
          this.loadProductsAndCategories();
        },
        error: error => {

          if (error.status === 401) return;

          this.alert.error('No se pudo cambiar el estado del producto');
        }
      });
    });
  }
}
