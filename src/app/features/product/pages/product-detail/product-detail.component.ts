import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';

import { CatalogProduct } from '../../models/catalog-product.model';
import { Category } from '../../models/category.model';

import { CartState } from '../../../cart/cart.state';
import { AuthState } from '../../../../core/auth/auth.state';

import { ReviewListComponent } from "../../../product-review/components/review-list/review-list.component";
import { ReviewFormComponent } from "../../../product-review/components/review-form/review-form.component";
import { ProductQuestionsComponent } from "../../../product-qa/components/product-questions/product-questions.component";
import { NavigationContextService } from '../../../../shared/navigation/navigation-context.service';

@Component({
  standalone: true,
  selector: 'app-product-detail',
  imports: [
    CommonModule,
    FormsModule,
    ReviewListComponent,
    ReviewFormComponent,
    ProductQuestionsComponent
  ],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {

  readonly product = signal<CatalogProduct | null>(null);
  readonly selectedImage = signal<string | null>(null);

  readonly allCategories = signal<Category[]>([]);

  quantity = 1;
  orderItemId?: string;

  // ===============================
  // breadcrumb REAL (jerarquía)
  // ===============================
  readonly breadcrumb = computed<Category[]>(() => {

    const p = this.product();
    if (!p?.categories?.length) return [];

    // usamos la primera categoría del producto
    const categoryId = p.categories[0].id;

    const categories = this.allCategories();
    const path: Category[] = [];

    let current = categories.find(c => c.id === categoryId);

    while (current) {
      path.unshift(current);

      if (!current.parentId) break;

      current = categories.find(c => c.id === current!.parentId);
    }

    return path;
  });

  readonly principales = computed(() =>
    this.product()?.attributes?.principales ?? []
  );

  readonly otros = computed(() =>
    this.product()?.attributes?.otros ?? []
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartState: CartState,
    private authState: AuthState,
    private navigationContext: NavigationContextService
  ) {}

  ngOnInit(): void {

  const id = this.route.snapshot.paramMap.get('id');
  if (!id) {
    this.goCatalog();
    return;
  }

  // cargar categorías
  this.categoryService.getCategories()
    .subscribe(c => this.allCategories.set(c));

  // cargar producto
  this.productService.getProductById(id)
    .subscribe(p => {
      this.product.set(p);
      this.quantity = 1;
      this.selectedImage.set(p.mainImageUrl ?? null);
    });
}

  galleryImages(): string[] {
    const p = this.product();
    if (!p?.mainImageUrl) return [];
    return [p.mainImageUrl];
  }

  selectImage(img: string): void {
    this.selectedImage.set(img);
  }

  isAvailable(): boolean {
    return (this.product()?.stock ?? 0) > 0;
  }

  stockLabel(): string {
    const stock = this.product()?.stock ?? 0;
    if (stock === 0) return 'Agotado';
    if (stock <= 3) return `Últimas ${stock} unidades`;
    return `Disponible (${stock} unidades)`;
  }

  addToCart(): void {
    if (!this.authState.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const p = this.product();
    if (!p) return;

    this.cartState.addItem(p.id, this.quantity);
  }

  // ===============================
  // navegación breadcrumb
  // ===============================
  goCatalog(): void {
    this.router.navigate(['/products']);
  }

  goCategory(categoryId: string): void {
    this.router.navigate(['/products'], {
      queryParams: { category: categoryId }
    });
  }


  getWhatsAppLink(product: CatalogProduct): string {

    const phone = "51916337058";

    const message =
    `Hola, estoy interesado en este producto:

    ${product.name}
    Precio: S/ ${product.price}

    ¿Podría darme más información?`;

      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }
}