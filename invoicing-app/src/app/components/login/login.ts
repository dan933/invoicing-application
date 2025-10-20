import { Component, computed, inject, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../services/auth/auth';
import { NavService } from '../../services/nav/nav';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
})
export class Login {
  router = inject(Router);
  authService = inject(Auth);
  navService = inject(NavService);
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);

  loginError = signal('');
  loading = signal(false);

  async login(isDemo?: boolean) {
    this.loading.set(true);
    this.loginError.set('');

    if (isDemo) {
      this.email.setValue('admin@proinvoice.com');
      this.password.setValue('examplePassword1234');
    }

    const loginResponse = await this.authService
      .login(this.email?.value || '', this.password?.value || '')
      .then(() => {
        this.navService.setMenuItems([{ link: '/customers', label: 'Customers' }]);
        this.router.navigate(['/customers']);
      })
      .catch((err: any) => {
        this.loginError.set(err?.message || 'Sorry something went wrong');
      })
      .finally(() => {
        this.loading.set(false);
      });

    console.log(loginResponse);
  }
}
