import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthLayoutComponent } from '../../../../layout/auth-layout/auth-layout.component';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  form: FormGroup;
  token: string | null = null;
  loading = false;
  success = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.error = 'Token inválido';
    }
  }

  submit(): void {
    if (this.form.invalid || !this.token || this.loading) return;

    const { password, confirmPassword } = this.form.value;

    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;

    this.authService
      .confirmPasswordReset(this.token, password)
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: () => {
          this.error = 'El enlace es inválido o ha expirado';
          this.loading = false;
        }
      });
  }
}
