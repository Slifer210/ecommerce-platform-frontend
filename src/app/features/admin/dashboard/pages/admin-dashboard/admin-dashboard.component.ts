import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { AdminDashboard } from '../../models/admin-dashboard.model';
import { SalesChartComponent } from "../../components/sales-chart.component";

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, SalesChartComponent],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {

  dashboard?: AdminDashboard;
  loading = false;

  constructor(private dashboardService: AdminDashboardService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.dashboardService.getDashboard().subscribe({
      next: data => {
        this.dashboard = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
