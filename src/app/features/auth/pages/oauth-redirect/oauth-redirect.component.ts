import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthState } from '../../../../core/auth/auth.state';

@Component({
    selector: 'app-oauth-redirect',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="min-h-screen flex items-center justify-center">
        <p class="text-center text-slate-600 text-sm animate-pulse">
            Iniciando sesión con Google…
        </p>
        </div>
    `
})
export class OauthRedirectComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authState: AuthState
    ) {}

    ngOnInit(): void {

        const token = this.route.snapshot.queryParamMap.get('token');

        if (!token) {
        this.router.navigate(['/auth/login']);
        return;
        }

        this.authState.setToken(token);

        this.authState.loadUser().subscribe(user => {

        if (!user) {
            this.router.navigate(['/auth/login']);
            return;
        }

        if (user.roles?.includes('ADMIN')) {
            this.router.navigate(['/admin']);
        } else {
            this.router.navigate(['/products']);
        }

        });
    }
}
