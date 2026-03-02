import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { SalesPoint } from '../models/admin-dashboard.model';

Chart.register(...registerables);

@Component({
    selector: 'app-sales-chart',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="bg-white p-4 rounded shadow mb-6">
        <h2 class="font-semibold mb-3">Ventas</h2>
        <canvas id="salesChart"></canvas>
        </div>
    `
})
export class SalesChartComponent implements OnChanges {

    @Input() data: SalesPoint[] = [];
    private chart?: Chart;

    ngOnChanges(): void {
        if (!this.data?.length) return;

        const labels = this.data.map(d => d.date);
        const values = this.data.map(d => d.total);

        this.chart?.destroy();

        this.chart = new Chart('salesChart', {
        type: 'line',
        data: {
            labels,
            datasets: [{
            label: 'Ventas (S/)',
            data: values,
            tension: 0.3
            }]
        }
        });
    }
}
