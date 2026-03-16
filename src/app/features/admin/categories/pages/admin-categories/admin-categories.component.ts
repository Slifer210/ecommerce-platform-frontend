import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminCategoryService } from '../../../products/services/admin-category.service';
import { Category } from '../../../products/models/category.model';
import { AlertService } from '../../../../../core/services/alert.service';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categories.component.html'
})
export class AdminCategoriesComponent implements OnInit {

  categories: Category[] = [];

  name = '';
  parentId: string | null = null;
  editing?: Category;

  @ViewChild('formTop', { static: true }) formTop!: ElementRef;
  @ViewChild('nameInput', { static: true }) nameInput!: ElementRef;

  constructor(
    private categoryService: AdminCategoryService,
    private alert: AlertService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.categoryService.getAll().subscribe({
      next: (c) => {
        this.categories = c ?? [];
      },
      error: (error) => {
        if (error.status === 401) return;
        if (
          error.status === 200 &&
          typeof error.error === 'string' &&
          error.error.includes('<!doctype html>')
        ) {
          this.categories = [];
          return;
        }
        if (error.status >= 500) {
          this.alert.error('Ocurrió un error del servidor');
          return;
        }
        this.categories = [];
      }
    });
  }

  save(): void {
    if (!this.name.trim()) {
      this.alert.error('El nombre es obligatorio');
      return;
    }

    const payload = {
      name: this.name,
      parentId: this.parentId
    };

    const action = this.editing
      ? this.categoryService.update(this.editing.id, payload)
      : this.categoryService.create(payload);

    action.subscribe({
      next: () => {
        this.alert.success(
          this.editing ? 'Categoría actualizada' : 'Categoría creada'
        );
        this.resetForm();
        this.load();
      },
      error: () => this.alert.error('No se pudo guardar la categoría')
    });
  }

  edit(category: Category): void {

    this.editing = category;
    this.name = category.name;
    this.parentId = category.parentId ?? null;

    setTimeout(() => {

      const container = document.querySelector('main');

      container?.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

    });

  }

  delete(id: string): void {
    this.alert.confirm('¿Eliminar esta categoría?').then(ok => {
      if (!ok) return;

      this.categoryService.delete(id).subscribe({
        next: () => {
          this.alert.success('Categoría eliminada');
          this.load();
        },
        error: () => this.alert.error('No se pudo eliminar la categoría')
      });
    });
  }

  resetForm(): void {
    this.name = '';
    this.parentId = null;
    this.editing = undefined;
  }

  // helpers visuales
  get parentCategories(): Category[] {
    return this.categories.filter(c => !c.parentId);
  }

  getChildren(parentId: string): Category[] {
    return this.categories.filter(c => c.parentId === parentId);
  }

  get parentCategoryName(): string | null {
    if (!this.parentId) {
      return null;
    }

    const parent = this.categories.find(c => c.id === this.parentId);
    return parent ? parent.name : null;
  }

}
