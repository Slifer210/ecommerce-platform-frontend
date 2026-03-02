import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminProduct } from '../../models/admin-product.model';
import { AdminProductImagesComponent } from '../admin-product-images/admin-product-images.component';
import { AlertService } from '../../../../../core/services/alert.service';

interface AttributeForm {
  name: string;
  value: string;
}

@Component({
  selector: 'app-admin-product-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminProductImagesComponent
  ],
  templateUrl: './admin-product-modal.component.html'
})
export class AdminProductModalComponent implements OnInit {

  @Input() product?: AdminProduct;
  @Output() save = new EventEmitter<Partial<AdminProduct>>();
  @Output() close = new EventEmitter<void>();

  form: Partial<AdminProduct> = {};

  principales: AttributeForm[] = [];
  otros: AttributeForm[] = [];

  constructor(private alert: AlertService) {}

  ngOnInit(): void {
    if (this.product) {
      this.form = {
        id: this.product.id,
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        stock: this.product.stock
      };

      const attrs = this.product.attributes ?? [];

      this.principales = attrs
        .filter(a => a.group === 'PRINCIPAL')
        .map(a => ({ name: a.name, value: a.value }));

      this.otros = attrs
        .filter(a => a.group === 'OTHER')
        .map(a => ({ name: a.name, value: a.value }));
    }
  }

  addPrincipal(): void {
    this.principales.push({ name: '', value: '' });
  }

  removePrincipal(index: number): void {
    this.principales.splice(index, 1);
  }

  addOtro(): void {
    this.otros.push({ name: '', value: '' });
  }

  removeOtro(index: number): void {
    this.otros.splice(index, 1);
  }

  submit(): void {
    if (!this.form.name || !this.form.price) {
      this.alert.error('Nombre y precio son obligatorios');
      return;
    }

    const attributes = [
      ...this.principales
        .filter(a => a.name && a.value)
        .map(a => ({ ...a, group: 'PRINCIPAL' as const })),
      ...this.otros
        .filter(a => a.name && a.value)
        .map(a => ({ ...a, group: 'OTHER' as const }))
    ];

    this.form.attributes = attributes;

    const title = this.product
      ? '¿Guardar cambios del producto?'
      : '¿Crear nuevo producto?';

    this.alert.confirm(title).then(ok => {
      if (!ok) return;
      this.save.emit(this.form);
    });
  }
}
