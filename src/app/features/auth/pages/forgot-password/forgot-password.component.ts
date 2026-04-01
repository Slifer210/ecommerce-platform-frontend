import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthLayoutComponent } from '../../../../layout/auth-layout/auth-layout.component';
import { AuthService } from '../../services/auth.service';
import { RecaptchaV3Service } from '../../../../core/services/recaptcha-v3.service';

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
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private recaptchaService: RecaptchaV3Service
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMessage = null;

    try {
      const captchaToken = await this.recaptchaService.execute('password_reset_request');

      await firstValueFrom(
        this.authService.requestPasswordReset({
          email: this.form.getRawValue().email,
          captchaToken
        })
      );

      this.success = true;
    } catch (error) {
      const isHttpError = typeof error === 'object' && error !== null && 'status' in error;

      if (isHttpError) {
        // Seguridad: siempre mostrar exito si el backend rechazo la solicitud.
        this.success = true;
      } else {
        this.errorMessage = 'No se pudo validar el captcha. Intenta de nuevo.';
      }
    } finally {
      this.loading = false;
    }
  }
}
