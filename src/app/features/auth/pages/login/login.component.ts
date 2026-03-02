import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.models';
import { AuthLayoutComponent } from '../../../../layout/auth-layout/auth-layout.component';
import { AuthState } from '../../../../core/auth/auth.state';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AuthLayoutComponent,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private authState: AuthState,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  submit(): void {

    if (this.form.invalid) {
      this.showValidationErrors();
      return;
    }

    if (this.loading) return;

    this.loading = true;

    const payload: LoginRequest = this.form.getRawValue();

    this.authService.login(payload).subscribe({
      next: res => {
        // Guardar token
        this.authState.setToken(res.token);

        // Cargar usuario
        this.authState.loadUser().subscribe(user => {

          this.loading = false;

          if (!user) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo cargar la información del usuario'
            });
            return;
          }

          // Redirección por rol
          if (user.roles?.includes('ADMIN')) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/products']);
          }

        });
      },
      error: err => {
        this.loading = false;

        // Credenciales inválidas (401)
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Credenciales incorrectas',
            text: 'El correo o la contraseña no son válidos'
          });
          return;
        }

        // Error genérico
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: 'Ocurrió un problema, intenta nuevamente'
        });
      }
    });
  }

  private showValidationErrors(): void {

    if (this.form.get('email')?.hasError('required')) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo requerido',
        text: 'Debes ingresar tu correo electrónico'
      });
      return;
    }

    if (this.form.get('email')?.hasError('email')) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Ingresa un correo electrónico válido'
      });
      return;
    }

    if (this.form.get('password')?.hasError('required')) {
      Swal.fire({
        icon: 'warning',
        title: 'Contraseña requerida',
        text: 'Debes ingresar tu contraseña'
      });
      return;
    }
  }

  loginWithGoogle(): void {
    window.location.href =
      'http://localhost:8080/oauth2/authorization/google';
  }
}
