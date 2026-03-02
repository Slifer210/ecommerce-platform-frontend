import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthLayoutComponent } from '../../../../layout/auth-layout/auth-layout.component';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AuthLayoutComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  form: FormGroup;
  loading = false;
  success = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;

    this.authService
      .requestPasswordReset(this.form.value.email)
      .subscribe({
        next: () => {
          this.success = true;
          this.loading = false;
        },
        error: () => {
          // Seguridad: siempre mostrar éxito
          this.success = true;
          this.loading = false;
        }
      });
  }
}
