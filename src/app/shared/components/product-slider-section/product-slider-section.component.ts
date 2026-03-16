import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit
} from '@angular/core';

import { CatalogProduct } from '../../../features/product/models/catalog-product.model';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../product-card/product-card.component';

@Component({
  selector: 'app-product-slider-section',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-slider-section.component.html',
  styleUrls: ['./product-slider-section.component.css'],
})
export class ProductSliderSectionComponent implements AfterViewInit {

  @Input() title!: string;
  @Input() subtitle!: string;
  @Input() products: CatalogProduct[] = [];

  @Output() productClick = new EventEmitter<CatalogProduct>();
  @Output() addToCartClick = new EventEmitter<CatalogProduct>();

  @ViewChild('container') container!: ElementRef;
  @ViewChildren('card', { read: ElementRef }) cards!: QueryList<ElementRef>;

  currentOffset = 0;
  cardWidth = 0;
  visibleCards = 1;

  ngAfterViewInit() {

    setTimeout(() => {

      const firstCard = this.cards.first.nativeElement;

      const cardRect = firstCard.getBoundingClientRect();

      const gap = 8; // gap-6 de Tailwind

      this.cardWidth = cardRect.width + gap;

      const viewportWidth =
        this.container.nativeElement.parentElement.offsetWidth;

      this.visibleCards = Math.floor(viewportWidth / this.cardWidth);

    });

  }

  scroll(direction: 'left' | 'right') {

    const maxOffset =
      Math.max(0, (this.products.length - this.visibleCards) * this.cardWidth);

    if (direction === 'right') {

      this.currentOffset = Math.min(
        this.currentOffset + this.visibleCards * this.cardWidth,
        maxOffset
      );

    }

    if (direction === 'left') {

      this.currentOffset = Math.max(
        this.currentOffset - this.visibleCards * this.cardWidth,
        0
      );

    }

  }

}