import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router
} from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { AdminQaService } from '../../products-qa/services/admin-qa.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent implements OnInit {

  badgeCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private qaService: AdminQaService
  ) {}

  ngOnInit(): void {
    /** Escucha reactiva */
    this.qaService.badgeCount$.subscribe(count => {
      this.badgeCount = count;
    });

    /** carga inicial */
    this.qaService.refreshBadgeCount();
  }

  logout(): void {
    this.authService.clearToken();
    this.router.navigate(['/auth/login']);
  }
}
