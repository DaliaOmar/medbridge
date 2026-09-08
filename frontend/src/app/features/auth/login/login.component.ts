import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    NgIf,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="login-container animate-fade-in-up">
      <mat-card class="login-card card">
        <mat-card-header class="login-header">
          <div class="logo-wrapper">
            <img src="/assets/med-bridge-logo.png" alt="Med Bridge Academy" class="logo-image" />
          </div>
          <mat-card-title>{{ 'auth.login.title' | translate }}</mat-card-title>
          <mat-card-subtitle>{{ 'auth.login.subtitle' | translate }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="alert()" class="auth-alert" [class.auth-alert--error]="alert()?.type === 'error'" role="alert" aria-live="polite">
            <mat-icon>{{ alert()?.type === 'error' ? 'error_outline' : 'check_circle' }}</mat-icon>
            <span>{{ alert()?.message }}</span>
          </div>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- Email -->
            <mat-form-field appearance="outline" class="form-field">
              <input matInput type="email" formControlName="email" autocomplete="email" [placeholder]="'auth.login.email' | translate" />
              <mat-icon matSuffix>email</mat-icon>
              <mat-hint>{{ 'auth.validation.emailHint' | translate }}</mat-hint>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                {{ 'auth.validation.emailRequired' | translate }}
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                {{ 'auth.validation.emailInvalid' | translate }}
              </mat-error>
            </mat-form-field>
            <!-- Password -->
            <mat-form-field appearance="outline" class="form-field">
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" autocomplete="current-password" [placeholder]="'auth.login.password' | translate" />
              <button mat-icon-button matSuffix (click)="togglePasswordVisibility($event)" type="button">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                {{ 'auth.validation.passwordRequired' | translate }}
              </mat-error>
            </mat-form-field>
            <!-- Submit Button -->
            <button mat-raised-button color="primary" type="submit" [disabled]="loginForm.invalid || loading()" class="btn-submit">
              <span *ngIf="!loading()">{{ 'auth.login.submit' | translate }}</span>
              <span *ngIf="loading()">{{ 'auth.login.loading' | translate }}</span>
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="login-actions">
          <p class="signup-prompt">
            {{ 'auth.login.noAccount' | translate }}
            <a routerLink="/auth/register" class="signup-link">{{ 'auth.login.register' | translate }}</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: calc(100vh - var(--navbar-height) - 100px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl);
      background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-2) 100%);
    }
    .login-card {
      width: 100%;
      max-width: 450px;
      padding: var(--space-xl) !important;
      border: none !important;
      background: var(--color-white) !important;
    }
    .login-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: var(--space-xl) ;
      padding: 0 !important;
      .logo-wrapper {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: var(--space-md);
        .logo-image {
          width: 160px;
          height: auto;
          display: block;
        }
      }
      mat-card-title {
        font-size: var(--font-size-2xl) !important;
        font-weight: 800 !important;
        color: var(--color-dark);
        margin-bottom: var(--space-xs) !important;
      }
      mat-card-subtitle {
        font-size: var(--font-size-sm) !important;
        color: var(--color-muted) !important;
      }
    }
    .auth-alert { display:flex; align-items:flex-start; gap:10px; margin-bottom:var(--space-md); padding:12px 14px; border-radius:var(--radius-md); background:#eaf7ef; border:1px solid #b9e2c7; color:#1f6b3b; font-size:var(--font-size-sm); line-height:1.5; }
    .auth-alert mat-icon { flex:0 0 auto; font-size:20px; width:20px; height:20px; }
    .auth-alert--error { background:#fff0f1; border-color:#f0b8be; color:#9b2635; }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .form-field {
      width: 100%;
      ::ng-deep .mat-mdc-text-field-wrapper {
        border: 1px solid var(--color-border-dark) !important;
        border-radius: var(--radius-md) !important;
        background: var(--color-bg) !important;
      }
      ::ng-deep .mdc-notched-outline { display: none; }
      ::ng-deep .mat-mdc-text-field-wrapper.mdc-text-field--focused {
        border-color: var(--color-primary) !important;
        box-shadow: 0 0 0 3px rgba(77, 90, 42, 0.12);
      }
      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        position: static;
        min-height: 22px;
      }
      ::ng-deep .mat-mdc-form-field-error-wrapper {
        position: static;
        padding: 6px 4px 0;
      }
      ::ng-deep .mat-mdc-form-field-hint-wrapper {
        position: static;
        padding: 6px 4px 0;
      }
      ::ng-deep .mat-mdc-form-field-error {
        display: block;
        color: var(--color-error);
        font-size: 12px;
        line-height: 1.4;
        white-space: normal;
      }
      ::ng-deep .mat-mdc-form-field-hint {
        font-size: 12px;
        line-height: 1.4;
        color: var(--color-muted);
        white-space: normal;
      }
    }
    .btn-submit {
      margin-top: var(--space-sm);
      height: 48px;
      font-size: var(--font-size-md) !important;
    }
    .login-actions {
      display: flex;
      justify-content: center;
      margin-top: var(--space-xl) !important;
      padding: 0 !important;
      .signup-prompt {
        font-size: var(--font-size-sm);
        color: var(--color-text-2);
        .signup-link {
          font-weight: 700;
          color: var(--color-primary);
          text-decoration: none;
          margin-left: 4px;
          [dir="rtl"] & {
            margin-left: 0;
            margin-right: 4px;
          }
          &:hover {
            color: var(--color-primary-dark);
            text-decoration: underline;
          }
        }
      }
    }
    [dir="rtl"] .login-container {
      mat-card-title, mat-card-subtitle, .signup-prompt {
        font-family: var(--font-arabic);
      }
    }
  `],
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  loginForm!: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);
  alert = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  returnUrl = '/';
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  togglePasswordVisibility(event: MouseEvent): void {
    event.preventDefault();
    this.hidePassword.update(v => !v);
  }
  onSubmit(): void {
    if (this.loginForm.invalid) return;
    this.alert.set(null);
    this.loading.set(true);
    const email = String(this.loginForm.value.email || '').trim().toLowerCase();
    const password = String(this.loginForm.value.password || '');
    this.authService.login({ email, password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toastService.success('Welcome back!');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.errorCode === 'ACCOUNT_DISABLED'
          ? 'Your account is currently disabled. Please contact support.'
          : 'Email or password is incorrect.';
        this.alert.set({ type: 'error', message });
        this.toastService.error(message);
      },
    });
  }
}
