import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CustomersReport, CustomersReportFilter } from '../../models/customer-report.model';
import { AdminCustomersReportService } from '../../services/admin-customers-report.service';
import { AlertService } from '../../../../../core/services/alert.service';

import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-customers-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customers-report.component.html'
})
export class CustomersReportComponent {

  loading = false;
  report: CustomersReport | null = null;

  filters: CustomersReportFilter = {
    status: 'ALL'
  };

  constructor(
    private reportService: AdminCustomersReportService,
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

    this.reportService.getCustomersReport(params).subscribe({
      next: report => {
        this.report = report;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('No se pudo cargar el reporte de clientes');
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
        text: 'No hay datos para exportar el reporte de clientes',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text('Reporte de Clientes', 14, 15);

    doc.setFontSize(10);
    doc.text(
      `Periodo: ${this.filters.from || '—'} a ${this.filters.to || '—'}`,
      14,
      22
    );

    doc.text(
      `Clientes totales: ${this.report.summary.totalCustomers}`,
      14,
      28
    );

    doc.text(
      `Clientes activos: ${this.report.summary.activeCustomers}`,
      14,
      33
    );

    doc.text(
      `Ingreso promedio por cliente: S/ ${this.report.summary.averageRevenuePerCustomer.toFixed(2)}`,
      14,
      38
    );

    autoTable(doc, {
      startY: 45,
      head: [[
        'Cliente',
        'Email',
        'Órdenes',
        'Total comprado (S/)',
        'Última compra'
      ]],
      body: this.report.rows.map(c => [
        c.fullName,
        c.email,
        c.totalOrders,
        c.totalSpent.toFixed(2),
        c.lastPurchase
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [21, 101, 192] } 
    });

    doc.save('reporte_clientes.pdf');
  }

  exportExcel(): void {
    if (!this.report) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin datos',
        text: 'No hay datos para exportar el reporte de clientes',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const worksheetData = [
      ['Reporte de Clientes'],
      [],
      ['Desde', this.filters.from || '—'],
      ['Hasta', this.filters.to || '—'],
      ['Estado', this.filters.status],
      [],
      ['Clientes totales', this.report.summary.totalCustomers],
      ['Clientes activos', this.report.summary.activeCustomers],
      ['Ingreso promedio por cliente (S/)', this.report.summary.averageRevenuePerCustomer],
      [],
      [
        'Cliente',
        'Email',
        'Órdenes',
        'Total comprado (S/)',
        'Última compra'
      ],
      ...this.report.rows.map(c => [
        c.fullName,
        c.email,
        c.totalOrders,
        c.totalSpent,
        c.lastPurchase
      ])
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook: XLSX.WorkBook = {
      Sheets: { Clientes: worksheet },
      SheetNames: ['Clientes']
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream'
    });

    saveAs(blob, 'reporte_clientes.xlsx');
  }

}
