import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../../../../layout/auth-layout/auth-layout.component';
import { AuthState } from '../../../../core/auth/auth.state';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
  imports: [
    CommonModule,
    AuthLayoutComponent
  ]
})
export class VerifyEmailComponent implements OnInit {

  status: 'loading' | 'success' | 'error' = 'loading';
  message = 'Verificando email...';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private authState: AuthState
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status = 'error';
      this.message = 'Token inválido';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: res => {
        this.status = 'success';
        this.message = res.message;

        // Guardar JWT devuelto por el backend
        if (res.token) {
          localStorage.setItem('token', res.token);

          // Cargar usuario autenticado (/me)
          this.authState.loadUser();

          // Pequeño delay para UX (ver mensaje de éxito)
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        }
      },
      error: () => {
        this.status = 'error';
        this.message = 'Error al verificar el email';
      }
    });
  }
}
