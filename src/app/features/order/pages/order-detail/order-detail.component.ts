import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { OrderService } from '../../services/order.service';
import { OrderDetail } from '../../models/order-detail.model';
import { OrderTimelineItem } from '../../models/order-timeline.model';
import { OrderStatus } from '../../models/order-summary.model';
import { CheckoutService } from '../../../cart/services/checkout.service';
import Swal from 'sweetalert2';
import { NotificationState } from '../../../notification/state/notification.state';
import { ReviewFormComponent } from "../../../product-review/components/review-form/review-form.component";
import { AppModalComponent } from "../../../../shared/components/app-modal/app-modal.component";

@Component({
  standalone: true,
  selector: 'app-order-detail',
  imports: [CommonModule, ReviewFormComponent, AppModalComponent],
  templateUrl: './order-detail.component.html'
})
export class OrderDetailComponent implements OnInit, OnDestroy {

  /* =========================
    STATE
  ========================== */

  readonly order = signal<OrderDetail | null>(null);
  readonly timeline = signal<OrderTimelineItem[]>([]);
  readonly loading = signal<boolean>(false);
  readonly reviewModalItem = signal<any | null>(null);
  private orderId: string | null = null;
  private pollingId: ReturnType<typeof setInterval> | null = null;

  /* =========================
    FLOW DE ESTADOS
  ========================== */

  readonly orderFlow: OrderStatus[] = [
    'PENDING',
    'PROCESSING',
    'PAID',
    'SHIPPED',
    'COMPLETED'
  ];

  /* =========================
    COMPUTEDS
  ========================== */

  readonly totalItems = computed(() =>
    this.order()
      ? this.order()!.items.reduce((sum, i) => sum + i.quantity, 0)
      : 0
  );

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private checkoutService: CheckoutService,
    private notificationState: NotificationState
  ) {}

  /* =========================
    INIT
  ========================== */

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {

      const newOrderId = params.get('id');

      if (!newOrderId) {
        this.router.navigate(['/my-orders']);
        return;
      }

      if (this.orderId === newOrderId) {
        return;
      }

      this.orderId = newOrderId;

      this.clearPolling();

      this.order.set(null);
      this.timeline.set([]);

      this.loadAll(true);

      this.startPolling();
    });
  }

  ngOnDestroy(): void {
    this.clearPolling();
  }

  /* =========================
    POLLING CONTROLADO
  ========================== */

  private startPolling(): void {

    this.clearPolling();

    const MAX_ATTEMPTS = 12;
    let attempts = 0;
    let verifying = false;

    this.pollingId = setInterval(() => {

      if (!this.orderId) {
        this.clearPolling();
        return;
      }

      const currentOrder = this.order();

      if (!currentOrder || currentOrder.status !== 'PROCESSING') {
        this.clearPolling();
        return;
      }

      if (attempts >= MAX_ATTEMPTS) {
        console.log('Polling detenido: tiempo máximo alcanzado');
        this.clearPolling();
        return;
      }

      if (verifying) return;

      verifying = true;
      attempts++;

      this.orderService.verifyPayment(this.orderId).subscribe({
        next: () => {
          this.loadAll(false);
        },
        error: () => {
          console.warn('Error verificando pago');
        },
        complete: () => {
          verifying = false;
        }
      });

    }, 5000);
  }

  private clearPolling(): void {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  }

  /* =========================
    LOADERS
  ========================== */

  private loadAll(showLoader = true): void {

    if (!this.orderId) return;

    if (showLoader) this.loading.set(true);

    this.orderService.getOrderDetail(this.orderId).subscribe({
      next: order => {

        order.items = order.items.map(item => ({
          ...item,
          showReviewForm: false
        }));

        this.order.set(order);
        this.loading.set(false);

        if (order.status !== 'PROCESSING') {
          this.clearPolling();
        }
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/my-orders']);
      }
    });

    this.orderService
      .getOrderTimeline(this.orderId)
      .subscribe(t => this.timeline.set(t));
  }

  /* =========================
    TIMELINE UI
  ========================== */

  isActive(status: OrderStatus): boolean {

    const current = this.order()?.status;
    if (!current) return false;

    return this.orderFlow.indexOf(status) <= this.orderFlow.indexOf(current);
  }

  isCurrent(status: OrderStatus): boolean {
    return this.order()?.status === status;
  }

  progressPercent(): number {

    const current = this.order()?.status;
    if (!current) return 0;

    const index = this.orderFlow.indexOf(current);
    return (index / (this.orderFlow.length - 1)) * 100;
  }

  statusLabel(status: OrderStatus): string {

    switch (status) {

      case 'PENDING':
        return 'Pendiente de pago';

      case 'PROCESSING':
        return 'Confirmando pago...';

      case 'PAID':
        return 'Pagado';

      case 'SHIPPED':
        return 'Enviado';

      case 'COMPLETED':
        return 'Completado';

      case 'CANCELLED':
        return 'Cancelado';

      default:
        return status;
    }
  }

  /* =========================
    ACTIONS
  ========================== */

  continuePayment(): void {

    const order = this.order();
    if (!order) return;

    if (order.status !== 'PENDING') {
      Swal.fire(
        'Pago no disponible',
        'Esta orden ya no puede pagarse nuevamente.',
        'info'
      );
      return;
    }

    this.checkoutService
      .getCheckoutByOrder(order.orderId)
      .subscribe({
        next: res => window.location.href = res.initPoint,
        error: () =>
          Swal.fire('Pago no disponible', 'Este pago ya no puede continuarse', 'info')
      });
  }

  completeOrder(): void {

    const order = this.order();
    if (!order) return;

    this.orderService.completeOrder(order.orderId).subscribe({
      next: () => {

        this.loadAll();
        this.notificationState.loadDropdown();
      },
      error: () =>
        Swal.fire('Error', 'No se pudo completar la orden', 'error')
    });
  }

  shipOrder(): void {

    const order = this.order();
    if (!order) return;

    this.orderService.shipOrder(order.orderId).subscribe({
      next: () => {

        this.loadAll();
        this.notificationState.loadDropdown();
      },
      error: () =>
        Swal.fire('Error', 'No se pudo enviar la orden', 'error')
    });
  }

  approvePayment(): void {

    const order = this.order();
    if (!order) return;

    this.orderService.approvePayment(order.orderId).subscribe({
      next: () => {

        this.loadAll();
        this.notificationState.loadDropdown();
      },
      error: () =>
        Swal.fire('Error', 'No se pudo aprobar el pago', 'error')
    });
  }

  cancelOrder(): void {

    const order = this.order();
    if (!order) return;

    Swal.fire({
      title: '¿Cancelar orden?',
      text: 'Esta acción liberará el stock reservado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      confirmButtonText: 'Sí, cancelar'
    }).then(result => {

      if (!result.isConfirmed) return;

      this.orderService.cancelOrder(order.orderId).subscribe({
        next: () => {

          this.loadAll();
          this.notificationState.loadDropdown();
        },
        error: () =>
          Swal.fire('Error', 'No se pudo cancelar la orden', 'error')
      });

    });
  }

  downloadReceipt(): void {

    const order = this.order();
    if (!order) return;

    this.orderService.downloadReceipt(order.orderId).subscribe(blob => {

      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${order.orderId}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    });
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  goBack(): void {
    this.router.navigate(['/my-orders']);
  }

  openReview(item:any){
    this.reviewModalItem.set(item);
  }

  closeReview(){
    this.reviewModalItem.set(null);
  }


  onReviewCreated(item: any, review: any): void {

    if (!review) {
      console.warn("Review payload vacío");
      return;
    }

    const order = this.order();
    if (!order) return;

    const updatedItems = order.items.map(i => {

      if (i.id === item.id) {

        return {
          ...i,
          reviewed: true,
          review: {
            rating: review.rating,
            comment: review.comment,
            imageUrls: review.imageUrls ?? []
          }
        };

      }

      return i;

    });

    this.order.set({
      ...order,
      items: updatedItems
    });

    // cerrar modal
    this.reviewModalItem.set(null);

  }
}