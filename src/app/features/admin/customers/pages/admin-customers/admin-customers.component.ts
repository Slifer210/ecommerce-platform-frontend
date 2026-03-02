import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminCustomerService } from '../../services/admin-customer.service';
import { AdminCustomer } from '../../models/admin-customer.model';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-customers.component.html'
})
export class AdminCustomersComponent implements OnInit {

  customers: AdminCustomer[] = [];
  filteredCustomers: AdminCustomer[] = [];
  loading = false;

  searchTerm = '';
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  emailFilter: 'ALL' | 'VERIFIED' | 'NOT_VERIFIED' = 'ALL';

  constructor(
    private customerService: AdminCustomerService,
    private router: Router          // 👈 IMPORTANTE
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.customerService.getAll().subscribe({
      next: data => {
        this.customers = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredCustomers = this.customers.filter(c => {
      const matchesSearch =
        c.email.toLowerCase().includes(term) ||
        (c.fullName?.toLowerCase().includes(term) ?? false);

      const matchesStatus =
        this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && c.active) ||
        (this.statusFilter === 'INACTIVE' && !c.active);

      const matchesEmail =
        this.emailFilter === 'ALL' ||
        (this.emailFilter === 'VERIFIED' && c.emailVerified) ||
        (this.emailFilter === 'NOT_VERIFIED' && !c.emailVerified);

      return matchesSearch && matchesStatus && matchesEmail;
    });
  }

  toggleActive(customer: AdminCustomer): void {
    const action$ = customer.active
      ? this.customerService.deactivate(customer.id)
      : this.customerService.activate(customer.id);

    action$.subscribe({
      next: () => this.load()
    });
  }

  /* =========================
   * VER ÓRDENES (AHORA SÍ)
   * ========================= */
  viewOrders(customerId: string): void {
    this.router.navigate(
      ['/admin/orders'],
      { queryParams: { customerId } }
    );
  }
}
