import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminReportService } from '../../services/admin-report.service';
import { SalesReport, SalesReportFilter } from '../../models/sales-report.model';
import { AlertService } from '../../../../../core/services/alert.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-report.component.html'
})
export class SalesReportComponent {

  loading = false;
  report: SalesReport | null = null;

  filters: SalesReportFilter = {
    status: 'ALL'
  };

  constructor(
    private reportService: AdminReportService,
    private alert: AlertService
  ) {}

  applyFilters(): void {
    this.loading = true;

    const params: any = {};

    if (this.filters.from) {
      params.from = this.filters.from;
    }

    if (this.filters.to) {
      params.to = this.filters.to;
    }


    if (this.filters.status && this.filters.status !== 'ALL') {
      params.status = this.filters.status;
    }

    this.reportService.getSalesReport(params).subscribe({
      next: report => {
        this.report = report;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('No se pudo cargar el reporte de ventas');
      }
    });
  }

  resetFilters(): void {
    this.filters = { status: 'ALL' };
    this.report = null;
  }

  exportPdf(): void {
    if (!this.report) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar el reporte en PDF',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Reporte de Ventas', 14, 15);

    doc.setFontSize(10);
    doc.text(
      `Periodo: ${this.filters.from || '—'} a ${this.filters.to || '—'}`,
      14,
      22
    );

    doc.text(
      `Total ingresos: S/ ${this.report.summary.totalRevenue}`,
      14,
      28
    );

    doc.text(
      `Órdenes: ${this.report.summary.totalOrders}`,
      14,
      33
    );

    autoTable(doc, {
    startY: 40,
    head: [[
      'Orden',
      'Fecha',
      'Cliente',
      'Productos',
      'Ítems',
      'Total (S/)',
      'Estado'
    ]],
    body: this.report.rows.map(r => [
      r.orderNumber,
      new Date(r.date).toLocaleString(),
      r.customerName,
      r.productsSummary,
      r.totalItems,
      r.total.toFixed(2),
      r.status
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] }
  });


    doc.save('reporte_ventas.pdf');
  }

  exportExcel(): void {
    if (!this.report) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar el reporte en Excel',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const worksheetData = [
    ['Reporte de Ventas'],
    [],
    ['Desde', this.filters.from || '—'],
    ['Hasta', this.filters.to || '—'],
    ['Estado', this.filters.status],
    [],
    ['Total ingresos', this.report.summary.totalRevenue],
    ['Total órdenes', this.report.summary.totalOrders],
    ['Ticket promedio', this.report.summary.averageTicket],
    ['Ítems promedio por orden', this.report.summary.averageItemsPerOrder],
    [],
    [
      'Orden',
      'Fecha',
      'Cliente',
      'Productos',
      'Ítems',
      'Total (S/)',
      'Estado'
    ],
    ...this.report.rows.map(r => [
      r.orderNumber,
      r.date,
      r.customerName,
      r.productsSummary,
      r.totalItems,
      r.total,
      r.status
    ])
  ];


    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook: XLSX.WorkBook = {
      Sheets: { Ventas: worksheet },
      SheetNames: ['Ventas']
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });

    saveAs(blob, 'reporte_ventas.xlsx');
  }

}
