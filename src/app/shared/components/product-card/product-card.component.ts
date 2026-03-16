import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductImageComponent } from '../product-image/product-image.component';
import { CatalogProduct } from '../../../features/product/models/catalog-product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, ProductImageComponent],
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {

  @Input({ required: true }) product!: CatalogProduct;

  @Output() productClick = new EventEmitter<CatalogProduct>();
  @Output() addToCartClick = new EventEmitter<CatalogProduct>();

  onProductClick() {
    this.productClick.emit(this.product);
  }

  onAddToCart(event: Event) {
    event.stopPropagation();
    this.addToCartClick.emit(this.product);
  }

}