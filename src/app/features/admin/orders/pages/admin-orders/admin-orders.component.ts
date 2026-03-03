import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { AdminOrderService } from '../../services/admin-order.service';
import { AdminOrder } from '../../models/admin-order.model';
import { OrderStatusHistory } from '../../models/order-status-history.model';
import { AlertService } from '../../../../../core/services/alert.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html'
})
export class AdminOrdersComponent implements OnInit {

  // =========================
  // DATA
  // =========================
  orders: AdminOrder[] = [];
  filteredOrders: AdminOrder[] = [];
  loading = false;

  // =========================
  // CUSTOMER (desde URL)
  // =========================
  customerId: string | null = null;

  // =========================
  // FILTROS FRONT
  // =========================
  searchTerm = '';
  statusFilter: 'ALL' | 'PAID' | 'SHIPPED' | 'COMPLETED' = 'ALL';
  sortOrder: 'DESC' | 'ASC' = 'DESC';

  // =========================
  // EXPORT MENU
  // =========================
  showExportMenu = false;

  // =========================
  // MODAL HISTORIAL
  // =========================
  history: OrderStatusHistory[] = [];
  showHistoryModal = false;

  constructor(
    private adminOrderService: AdminOrderService,
    private alert: AlertService,
    private route: ActivatedRoute   
  ) {}

  ngOnInit(): void {
    this.customerId = this.route.snapshot.queryParamMap.get('customerId');
    this.loadOrders();
  }

  // =========================
  // CARGA (BACKEND FILTER)
  // =========================
  loadOrders(): void {
    this.loading = true;

    this.adminOrderService.getAll(this.customerId ?? undefined).subscribe({
      next: orders => {
        this.orders = orders;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('No se pudo cargar la lista de órdenes');
      }
    });
  }

  // =========================
  // FILTROS FRONT (ID + ESTADO)
  // =========================
  applyFilters(): void {
    this.filteredOrders = this.orders
      .filter(o => {

        const matchesSearch =
          !this.searchTerm ||
          o.orderId.toLowerCase().includes(this.searchTerm.toLowerCase());

        const matchesStatus =
          this.statusFilter === 'ALL' ||
          o.status === this.statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return this.sortOrder === 'DESC'
          ? dateB - dateA
          : dateA - dateB;
      });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  toggleSort(): void {
    this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
    this.applyFilters();
  }

  // =========================
  // EXPORT MENU
  // =========================
  toggleExportMenu(): void {
    this.showExportMenu = !this.showExportMenu;
  }

  closeExportMenu(): void {
    this.showExportMenu = false;
  }

  // =========================
  // EXPORTAR PDF
  // =========================
  exportPdf(): void {
    if (this.filteredOrders.length === 0) {
      this.alert.error('No hay datos para exportar');
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Reporte de Órdenes', 14, 15);

    doc.setFontSize(10);
    doc.text(`Estado: ${this.statusFilter}`, 14, 22);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 27);

    autoTable(doc, {
      startY: 32,
      head: [['ID', 'Estado', 'Total', 'Fecha']],
      body: this.filteredOrders.map(o => [
        o.orderId,
        o.status,
        `S/ ${o.total}`,
        new Date(o.createdAt).toLocaleString()
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 220, 220] }
    });

    doc.save('ordenes.pdf');
  }

  // =========================
  // EXPORTAR EXCEL
  // =========================
  exportExcel(): void {
    if (this.filteredOrders.length === 0) {
      this.alert.error('No hay datos para exportar');
      return;
    }

    const data = this.filteredOrders.map(o => ({
      ID: o.orderId,
      Estado: o.status,
      Total: o.total,
      Fecha: new Date(o.createdAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Órdenes');

    const buffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    saveAs(
      new Blob([buffer], { type: 'application/octet-stream' }),
      'ordenes.xlsx'
    );
  }

  // =========================
  // EXPORTAR CSV
  // =========================
  exportCsv(): void {
    if (this.filteredOrders.length === 0) {
      this.alert.error('No hay datos para exportar');
      return;
    }

    const headers = ['ID', 'Estado', 'Total', 'Fecha'];

    const rows = this.filteredOrders.map(o => [
      o.orderId,
      o.status,
      o.total,
      new Date(o.createdAt).toLocaleString()
    ]);

    const csv =
      [headers, ...rows]
        .map(row => row.map(v => `"${v}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    saveAs(blob, 'ordenes.csv');
  }

  // =========================
  // ACCIONES
  // =========================
  ship(orderId: string): void {
    this.alert.confirm('¿Marcar esta orden como ENVIADA?', 'Confirmar envío')
      .then(ok => {
        if (!ok) return;

        this.adminOrderService.ship(orderId).subscribe({
          next: () => {
            this.alert.success('Orden marcada como enviada');
            this.loadOrders();
          },
          error: () => {
            this.alert.error('No se pudo marcar la orden como enviada');
          }
        });
      });
  }

  complete(orderId: string): void {
    this.alert.confirm('¿Marcar esta orden como COMPLETADA?', 'Confirmar entrega')
      .then(ok => {
        if (!ok) return;

        this.adminOrderService.complete(orderId).subscribe({
          next: () => {
            this.alert.success('Orden completada correctamente');
            this.loadOrders();
          },
          error: () => {
            this.alert.error('No se pudo completar la orden');
          }
        });
      });
  }

  viewHistory(orderId: string): void {
    this.adminOrderService.getHistory(orderId).subscribe({
      next: (history) => {
        this.history = history ?? [];
        this.showHistoryModal = true;
      },
      error: (error) => {
        if (error.status === 401) return;
        if (error.status >= 500) {
          this.alert.error('Ocurrió un error del servidor');
          return;
        }
        this.history = [];
        this.showHistoryModal = true;
      }
    });
  }
  closeHistory(): void {
    this.showHistoryModal = false;
    this.history = [];
  }
}
