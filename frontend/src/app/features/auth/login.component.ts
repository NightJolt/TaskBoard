import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Welcome Back</mat-card-title>
          <mat-card-subtitle>Login to TaskBoard</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
              @if (form.controls.email.hasError('required')) {
                <mat-error>Email is required</mat-error>
              } @else if (form.controls.email.hasError('email')) {
                <mat-error>Invalid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.controls.password.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || loading"
            >
              {{ loading ? 'Logging in...' : 'Login' }}
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <span>Don't have an account? <a routerLink="/register">Register</a></span>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 24px;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    mat-form-field {
      width: 100%;
    }

    button[type="submit"] {
      height: 48px;
      font-size: 16px;
    }

    mat-card-actions {
      text-align: center;
      padding-top: 16px;
    }

    a {
      color: #1976d2;
      text-decoration: none;
    }
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  hidePassword = true;
  loading = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const { email, password } = this.form.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading = false;
        this.snackBar.open(
          err.error?.message || 'Login failed',
          'Close',
          { duration: 5000 },
        );
      },
    });
  }
}
