import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AuthLayoutComponent } from '../../../../layout/auth-layout/auth-layout.component';

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
    private authService: AuthService
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) return;

    this.loading = true;
    this.errorMessage = null;

    const { firstName, lastName, email, password } = this.form.value;

    const payload = {
      fullName: `${firstName} ${lastName}`.trim(),
      email,
      password
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo completar el registro';
        this.loading = false;
      }
    });
  }
}
