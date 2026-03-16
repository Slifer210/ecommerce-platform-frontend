import {
  Component,
  OnInit,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';

import { NavigationContextService } from '../../../../shared/navigation/navigation-context.service';
import { CatalogProduct } from '../../models/catalog-product.model';
import { Category } from '../../models/category.model';
import {
  CategoryFacet,
  AttributeFacet,
  PriceRangeFacet
} from '../../models/catalog-facets.response';

import { AuthState } from '../../../../core/auth/auth.state';
import { CartState } from '../../../cart/cart.state';
import { CatalogState } from '../../models/catalog.state';

import { CatalogSidebarComponent } from '../../components/catalog-sidebar/catalog-sidebar.component';
import { ProductCardComponent } from '../../../../shared/components/product-card/product-card.component';
import { ProductSliderSectionComponent } from "../../../../shared/components/product-slider-section/product-slider-section.component";
import { BreadcrumbComponent } from '../../../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from "../../../../shared/components/pagination/pagination.component";
import { CatalogControlsComponent } from "../../../../shared/components/catalog-controls/catalog-controls.component";
type SortKey =
  | 'relevance'
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'rating_desc';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, CatalogSidebarComponent, RouterModule, ProductCardComponent, ProductSliderSectionComponent, BreadcrumbComponent, PaginationComponent, CatalogControlsComponent],
  templateUrl: './catalog.component.html'
})
export class CatalogComponent implements OnInit {

  // ===============================
  // referencia slider trending
  // ===============================

  readonly detectedCategoryId = signal<string | null>(null);
  // ===== Grid (explorar) =====
  readonly products = signal<CatalogProduct[]>([]);
  readonly loading = signal(false);

  // ===== Categorías para breadcrumb / sidebar =====
  readonly allCategories = signal<Category[]>([]);

  // ===== Filtros =====
  readonly selectedAttributes = signal<Map<string, string[]>>(new Map());

  readonly facetCategories = signal<CategoryFacet[]>([]);
  readonly facetAttributes = signal<AttributeFacet[]>([]);
  readonly facetPriceRanges = signal<PriceRangeFacet[]>([]);

  readonly appliedCategoryId = signal<string | null>(null);
  readonly appliedMinPrice = signal<number | null>(null);
  readonly appliedMaxPrice = signal<number | null>(null);

  // ===== Home (hero / quick / sections) =====
  readonly hero = signal<{ title: string; subtitle: string } | null>(null);

  readonly quickCategories = signal<Category[]>([]);

  readonly trending = signal<CatalogProduct[]>([]);
  readonly bestSellers = signal<CatalogProduct[]>([]);
  readonly newProducts = signal<CatalogProduct[]>([]);
  readonly topRated = signal<CatalogProduct[]>([]);

  // ===== Paginación / ordenamiento =====
  readonly currentPage = signal(0);
  readonly pageSize = signal(12);

  readonly totalElements = signal(0);
  readonly totalPages = signal(0);

  readonly sortKey = signal<SortKey>('relevance');

  readonly exploreMode = signal(false);

  // ===== Internals =====
  private suppressUrlSync = false;
  private lastQ: string | null = null;

  // ===== Computeds =====
  readonly categoryTree = computed(() => {

    const search = this.catalogState.searchApplied();
    const filters = this.catalogState.hasActiveFilters();

    const selectedCategory =
      this.appliedCategoryId() ??
      this.detectedCategoryId();

    let source: Category[];

    // ===============================
    // SEARCH / FACETS MODE
    // ===============================
    if (search || filters) {

      source = this.mapFacetsToCategories();

    } else {

      source = this.allCategories();

    }

    // ===============================
    // CATEGORY FILTER (IMPORTANT)
    // ===============================
    if (selectedCategory && !search) {

      const byId = new Map(source.map(c => [c.id, c]));
      const allowed = new Set<string>();

      // selected
      allowed.add(selectedCategory);

      // parent
      const parentId = byId.get(selectedCategory)?.parentId;

      if (parentId) {

        allowed.add(parentId);

        // siblings
        source
          .filter(c => c.parentId === parentId)
          .forEach(c => allowed.add(c.id));

      }

      // children
      source
        .filter(c => c.parentId === selectedCategory)
        .forEach(c => allowed.add(c.id));

      source = source.filter(c => allowed.has(c.id));

    }

    // ===============================
    // BUILD TREE
    // ===============================
    const tree = new Map<string | null, Category[]>();

    for (const c of source) {

      const key = c.parentId ?? null;

      if (!tree.has(key)) {
        tree.set(key, []);
      }

      tree.get(key)!.push(c);

    }

    return tree;

  });

  readonly rootCategories = computed(() =>
    this.categoryTree().get(null) ?? []
  );

  readonly breadcrumb = computed(() => {

    const categoryId =
      this.appliedCategoryId() ??
      this.detectedCategoryId();

    console.log("detectedCategoryId:", this.detectedCategoryId());
    console.log("appliedCategoryId:", this.appliedCategoryId());
    console.log("categories loaded:", this.allCategories().length);
    if (!categoryId) return [];

    const categories = this.allCategories();
    const path: Category[] = [];

    let current: Category | undefined =
      categories.find(c => c.id === categoryId);

    while (current) {
      path.unshift(current);

      const parentId = current.parentId;
      if (!parentId) break;

      current = categories.find(c => c.id === parentId);
    }

    return path;

  });

  readonly showingFrom = computed(() => {
    const total = this.totalElements();
    if (total === 0) return 0;
    return this.currentPage() * this.pageSize() + 1;
  });

  readonly showingTo = computed(() => {
    const total = this.totalElements();
    if (total === 0) return 0;
    const end = (this.currentPage() + 1) * this.pageSize();
    return Math.min(end, total);
  });

  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 1) return [];

    const windowSize = 7;
    const half = Math.floor(windowSize / 2);

    let start = Math.max(0, current - half);
    let end = Math.min(total - 1, start + windowSize - 1);
    start = Math.max(0, end - windowSize + 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartState: CartState,
    private authState: AuthState,
    private router: Router,
    private route: ActivatedRoute,
    public catalogState: CatalogState,
    private navigationContext: NavigationContextService
  ) {}

  ngOnInit(): void {

    this.loadCategories();
    this.loadHome();

    this.route.queryParams.subscribe(params => {

      this.suppressUrlSync = true;

      // ===============================
      // VIEW MODE (explore)
      // ===============================
      const view = params['view'] ?? null;
      this.exploreMode.set(view === 'all');

      // ===============================
      // PAGINATION / SORT
      // ===============================
      const page = Number(params['page'] ?? 0);
      const size = Number(params['size'] ?? 12);
      const sort = (params['sort'] ?? 'relevance') as SortKey;

      this.currentPage.set(Number.isFinite(page) && page >= 0 ? page : 0);
      this.pageSize.set(Number.isFinite(size) && size > 0 ? size : 12);
      this.sortKey.set(sort);

      // ===============================
      // SEARCH (q)
      // ===============================
      const qParamRaw = params['q'] ?? null;
      const q = (qParamRaw?.toString().trim() || null);

      const qChanged = q !== this.lastQ;
      if (qChanged) {
        this.resetFacetFiltersForNewSearch();
        this.currentPage.set(0);
        this.lastQ = q;
      }

      if (q) {
        this.catalogState.setQueryFromUrl(q);
      } else {
        this.catalogState.clearSearch();
      }

      // ===============================
      // CATEGORY
      // ===============================
      const categoryFromUrl = params['category'] ?? null;
      this.appliedCategoryId.set(categoryFromUrl);
      this.catalogState.setCategoryFromUrl(categoryFromUrl);

      // ===============================
      // PRICE FILTERS
      // ===============================
      this.appliedMinPrice.set(
        params['min'] != null ? Number(params['min']) : null
      );

      this.appliedMaxPrice.set(
        params['max'] != null ? Number(params['max']) : null
      );

      // ===============================
      // EXECUTE QUERY
      // ===============================
      this.executeQuery();
      this.suppressUrlSync = false;
    });
  }

  // ===============================
  // HOME
  // ===============================
  private loadHome(): void {
    this.productService.getCatalogHome().subscribe({
      next: (res: any) => {
        this.hero.set(res?.hero ?? null);
        this.quickCategories.set(res?.quickCategories ?? []);
        this.trending.set(res?.trending ?? []);
        this.bestSellers.set(res?.bestSellers ?? []);
        this.newProducts.set(res?.newProducts ?? []);
        this.topRated.set(res?.topRated ?? []);
      },
      error: () => {
        this.hero.set(null);
        this.quickCategories.set([]);
        this.trending.set([]);
        this.bestSellers.set([]);
        this.newProducts.set([]);
        this.topRated.set([]);
      }
    });
  }
  scrollSlider(container: HTMLElement, direction: 'left' | 'right') {

    const scrollAmount = 320;

    container.scrollBy({
      left: direction === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });

  }
  // ===============================
  // FILTER EVENTS
  // ===============================
  onAttributeToggle(event: { name: string; value: string }): void {
    const key = event.name.trim().toLowerCase();
    const value = event.value.trim().toLowerCase();
    if (!key || !value) return;

    const map = new Map(this.selectedAttributes());
    const values = map.get(key) ?? [];

    values.includes(value)
      ? map.set(key, values.filter(v => v !== value))
      : map.set(key, [...values, value]);

    if (map.get(key)?.length === 0) map.delete(key);

    this.selectedAttributes.set(map);
    this.currentPage.set(0);
    this.executeQuery();
  }

  onPriceSelect(event: { min: number | null; max: number | null }): void {
    this.appliedMinPrice.set(event.min);
    this.appliedMaxPrice.set(event.max);
    this.currentPage.set(0);
    this.executeQuery();
  }

  onCategorySelect(categoryId: string | null): void {
    this.navigationContext.setCategory(categoryId);
    this.appliedCategoryId.set(categoryId);
    this.catalogState.setCategoryFromUrl(categoryId);
    this.currentPage.set(0);
    this.executeQuery();
  }

  clearSearchAndReset(): void {
    this.catalogState.clearSearch();
    this.catalogState.clearCategory();

    this.appliedCategoryId.set(null);
    this.appliedMinPrice.set(null);
    this.appliedMaxPrice.set(null);
    this.selectedAttributes.set(new Map());

    this.currentPage.set(0);
    this.pageSize.set(12);
    this.sortKey.set('relevance');

    this.lastQ = null;

    this.suppressUrlSync = true;
    this.router.navigate(['/products'], { queryParams: {}, replaceUrl: true })
      .then(() => {
        this.executeQuery();
        this.suppressUrlSync = false;
      });
  }

  getFacetCount(categoryId: string): number {

    const facets = this.facetCategories();
    const all = this.allCategories();

    // conteo directo
    let total = facets.find(f => f.id === categoryId)?.count ?? 0;

    // sumar hijos
    const children = all.filter(c => c.parentId === categoryId);

    for (const child of children) {
      const childFacet = facets.find(f => f.id === child.id);
      if (childFacet) {
        total += childFacet.count;
      }
    }

    return total;
  }

  // ===============================
  // GRID QUERY
  // ===============================
  private executeQuery(): void {
    this.loading.set(true);

    const attributes: Record<string, string[]> =
      this.selectedAttributes().size > 0
        ? Object.fromEntries(this.selectedAttributes())
        : {};

    this.productService.getCatalogProducts({
      categoryId: this.appliedCategoryId(),
      search: this.catalogState.searchApplied(),
      minPrice: this.appliedMinPrice(),
      maxPrice: this.appliedMaxPrice(),
      attributes,
      page: this.currentPage(),
      size: this.pageSize(),
      sort: this.sortKey(),
    }).subscribe({
      next: (res: any) => {

        this.products.set(res?.page?.content ?? []);
        const ctx = res?.searchContext;
          console.log("searchContext:", ctx);
          if (ctx?.dominantCategoryId) {
            this.detectedCategoryId.set(ctx.dominantCategoryId);
          } else {
            this.detectedCategoryId.set(null);
        }

        this.facetCategories.set(res?.facets?.categories ?? []);
        this.facetAttributes.set(res?.facets?.attributes ?? []);
        this.facetPriceRanges.set(res?.facets?.priceRanges ?? []);

        this.totalElements.set(res?.page?.totalElements ?? 0);
        this.totalPages.set(res?.page?.totalPages ?? 0);
        this.currentPage.set(res?.page?.number ?? this.currentPage());
        this.pageSize.set(res?.page?.size ?? this.pageSize());

        this.loading.set(false);
        this.syncUrlFromState();
      },
      error: () => {
        this.products.set([]);
        this.totalElements.set(0);
        this.totalPages.set(0);
        this.loading.set(false);
      }
    });
  }

  private syncUrlFromState(): void {
    if (this.suppressUrlSync) return;

    const qp: any = {};

    if (this.exploreMode()) {
      qp.view = 'all';
    }

    if (this.appliedCategoryId()) qp.category = this.appliedCategoryId();
    if (this.catalogState.searchApplied()) qp.q = this.catalogState.searchApplied();
    if (this.appliedMinPrice() != null) qp.min = this.appliedMinPrice();
    if (this.appliedMaxPrice() != null) qp.max = this.appliedMaxPrice();

    if (this.currentPage() > 0) qp.page = this.currentPage();
    if (this.pageSize() !== 12) qp.size = this.pageSize();
    if (this.sortKey() !== 'relevance') qp.sort = this.sortKey();

    this.router.navigate(['/products'], {
      queryParams: qp,
      replaceUrl: true
    });
  }


  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.executeQuery();
  }

  onPageSizeChange(size: number | string): void {
    const parsed = Number(size);
    this.pageSize.set(parsed > 0 ? parsed : 12);
    this.currentPage.set(0);
    this.executeQuery();
  }

  onSortChange(key: string): void {
    this.sortKey.set(key as SortKey);
    this.currentPage.set(0);
    this.executeQuery();
  }

  scrollToExplore(): void {
    this.onCategorySelect(null);
    setTimeout(() => {
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }, 0);
  }

  private loadCategories(): void {
    this.categoryService.getCategories()
      .subscribe(c => this.allCategories.set(c));
  }

  private mapFacetsToCategories(): Category[] {

    const all = this.allCategories();
    const facets = this.facetCategories();

    const byId = new Map(all.map(c => [c.id, c]));
    const collected = new Map<string, Category>();

    for (const facet of facets) {

      let current = byId.get(facet.id);

      while (current) {

        if (!collected.has(current.id)) {

          collected.set(current.id, {
            id: current.id,
            name: current.name,
            parentId: current.parentId
          });

        }

        // agregar hijos también
        all
          .filter(c => c.parentId === current!.id)
          .forEach(child => {
            if (!collected.has(child.id)) {
              collected.set(child.id, child);
            }
          });

        current = current.parentId
          ? byId.get(current.parentId)
          : undefined;

      }

    }

    return Array.from(collected.values());
  }

  isExploreMode(): boolean {
    return this.exploreMode();
  }

  private resetFacetFiltersForNewSearch(): void {
    this.selectedAttributes.set(new Map());
    this.appliedMinPrice.set(null);
    this.appliedMaxPrice.set(null);
    this.appliedCategoryId.set(null);
    this.catalogState.clearCategory();
  }

  goToProduct(product: CatalogProduct): void {
    this.navigationContext.setCategory(this.appliedCategoryId());
    this.router.navigate(['/products', product.id]);
  }

  goToExploreMode(): void {

    this.exploreMode.set(true);

    this.appliedCategoryId.set(null);
    this.catalogState.clearCategory();

    this.currentPage.set(0);

    this.router.navigate(['/products'], {
      queryParams: { view: 'all' },
      replaceUrl: true
    });

    this.executeQuery();
  }


  addToCart(product: CatalogProduct): void {
    if (!this.authState.isAuthenticated()) {
      Swal.fire({ icon: 'info', title: 'Inicia sesión' });
      return;
    }
    this.cartState.addItem(product.id);
  }
}
