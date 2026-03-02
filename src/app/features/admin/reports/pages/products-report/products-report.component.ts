import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ProductsReport, ProductsReportFilter } from '../../models/product-report.model';
import { AdminProductsReportService } from '../../services/admin-products-report.service';
import { AlertService } from '../../../../../core/services/alert.service';

import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-products-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-report.component.html'
})
export class ProductsReportComponent {

  loading = false;
  report: ProductsReport | null = null;

  filters: ProductsReportFilter = {
    status: 'ALL'
  };

  constructor(
    private reportService: AdminProductsReportService,
    private alert: AlertService
  ) {}

  /* =========================
   * FILTROS
   * ========================= */
  applyFilters(): void {
    this.loading = true;

    const params: any = {};

    if (this.filters.from) params.from = this.filters.from;
    if (this.filters.to) params.to = this.filters.to;
    if (this.filters.status && this.filters.status !== 'ALL') {
      params.status = this.filters.status;
    }

    this.reportService.getProductsReport(params).subscribe({
      next: report => {
        this.report = report;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('No se pudo cargar el reporte de productos');
      }
    });
  }

  resetFilters(): void {
    this.filters = { status: 'ALL' };
    this.report = null;
  }

  /* =========================
   * EXPORTAR PDF
   * ========================= */
  exportPdf(): void {
    if (!this.report) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar el reporte de productos',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const doc = new jsPDF();

    // Título
    doc.setFontSize(16);
    doc.text('Reporte de Productos', 14, 15);

    // Resumen
    doc.setFontSize(10);
    doc.text(
      `Periodo: ${this.filters.from || '—'} a ${this.filters.to || '—'}`,
      14,
      22
    );

    doc.text(
      `Productos vendidos: ${this.report.summary.totalProducts}`,
      14,
      28
    );

    doc.text(
      `Ingresos totales: S/ ${this.report.summary.totalRevenue.toFixed(2)}`,
      14,
      33
    );

    if (this.report.summary.topProductName) {
      doc.text(
        `Producto más vendido: ${this.report.summary.topProductName}`,
        14,
        38
      );
    }

    // Tabla
    autoTable(doc, {
      startY: 45,
      head: [[
        'Producto',
        'Categoría',
        'Precio',
        'Stock',
        'Reservado',
        'Vendidos',
        'Ingresos (S/)',
        'Última venta',
        'Estado'
      ]],
      body: this.report.rows.map(r => [
        r.productName,
        r.category,
        r.currentPrice.toFixed(2),
        r.stock,
        r.reservedStock,
        r.totalQuantity,
        r.totalRevenue.toFixed(2),
        r.lastSale,
        r.active ? 'Activo' : 'Inactivo'
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [46, 125, 50] }
    });

    doc.save('reporte_productos.pdf');
  }

  /* =========================
   * EXPORTAR EXCEL
   * ========================= */
  exportExcel(): void {
    if (!this.report) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar el reporte de productos',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const worksheetData = [
      ['Reporte de Productos'],
      [],
      ['Desde', this.filters.from || '—'],
      ['Hasta', this.filters.to || '—'],
      ['Estado órdenes', this.filters.status],
      [],
      ['Productos vendidos', this.report.summary.totalProducts],
      ['Ingresos totales (S/)', this.report.summary.totalRevenue],
      ['Producto más vendido', this.report.summary.topProductName || '—'],
      [],
      [
        'Producto',
        'Categoría',
        'Precio',
        'Stock',
        'Reservado',
        'Vendidos',
        'Ingresos (S/)',
        'Última venta',
        'Estado'
      ],
      ...this.report.rows.map(r => [
        r.productName,
        r.category,
        r.currentPrice,
        r.stock,
        r.reservedStock,
        r.totalQuantity,
        r.totalRevenue,
        r.lastSale,
        r.active ? 'Activo' : 'Inactivo'
      ])
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook: XLSX.WorkBook = {
      Sheets: { Productos: worksheet },
      SheetNames: ['Productos']
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });

    saveAs(blob, 'reporte_productos.xlsx');
  }
}
