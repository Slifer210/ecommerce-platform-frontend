import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-image.component.html'
})
export class ProductImageComponent {

  @Input() src: string | null | undefined;
  @Input() alt: string = '';

  imageError = false;

  onError() {
    this.imageError = true;
  }

}