import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../../../../layout/auth-layout/auth-layout.component';
import { RecaptchaV3Service } from '../../../../core/services/recaptcha-v3.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthLayoutComponent,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  success = false;
  loading = false;
  errorMessage: string | null = null;
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private recaptchaService: RecaptchaV3Service
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMessage = null;

    try {
      const { firstName, lastName, email, password } = this.form.getRawValue();
      const captchaToken = await this.recaptchaService.execute('register');

      await firstValueFrom(this.authService.register({
        fullName: `${firstName} ${lastName}`.trim(),
        email,
        password,
        captchaToken
      }));

      this.success = true;
    } catch {
      this.errorMessage = 'No se pudo completar el registro. Intenta de nuevo.';
    } finally {
      this.loading = false;
    }
  }
}
