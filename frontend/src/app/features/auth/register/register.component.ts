import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
  selector: 'app-register',
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
    <div class="register-container animate-fade-in-up">
      <mat-card class="register-card card">
        <mat-card-header class="register-header">
          <div class="logo-wrapper">
            <img src="/assets/med-bridge-logo.png" alt="Med Bridge Academy" class="logo-image" />
          </div>
          <mat-card-title>{{ 'auth.register.title' | translate }}</mat-card-title>
          <mat-card-subtitle>{{ 'auth.register.subtitle' | translate }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="alert()" class="auth-alert" [class.auth-alert--error]="alert()?.type === 'error'" role="alert" aria-live="polite">
            <mat-icon>{{ alert()?.type === 'error' ? 'error_outline' : 'check_circle' }}</mat-icon>
            <span>{{ alert()?.message }}</span>
          </div>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <!-- Name Group (First & Last) -->
            <div class="form-row">
              <mat-form-field appearance="outline" class="form-field">
                <input matInput formControlName="firstName" autocomplete="given-name" maxlength="80" [placeholder]="'auth.register.firstName' | translate" />
                <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                  {{ 'auth.validation.firstNameRequired' | translate }}
                </mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline" class="form-field">
                <input matInput formControlName="lastName" autocomplete="family-name" maxlength="80" [placeholder]="'auth.register.lastName' | translate" />
                <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                  {{ 'auth.validation.lastNameRequired' | translate }}
                </mat-error>
              </mat-form-field>
            </div>
            <!-- Email -->
            <mat-form-field appearance="outline" class="form-field">
              <input matInput type="email" formControlName="email" autocomplete="email" maxlength="254" [placeholder]="'auth.register.email' | translate" />
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                {{ 'auth.validation.emailRequired' | translate }}
              </mat-error>
              <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                {{ 'auth.validation.emailInvalid' | translate }}
              </mat-error>
            </mat-form-field>
            <!-- Phone -->
            <mat-form-field appearance="outline" class="form-field">
              <input matInput type="tel" formControlName="phone" autocomplete="tel" maxlength="30" [placeholder]="'auth.register.phone' | translate" />
              <mat-icon matSuffix>phone</mat-icon>
              <mat-error *ngIf="registerForm.get('phone')?.hasError('required')">{{ 'auth.validation.phoneRequired' | translate }}</mat-error>
            </mat-form-field>
            <!-- Password -->
            <mat-form-field appearance="outline" class="form-field">
              <input matInput [type]="hidePassword() ? 'password' : 'text'" formControlName="password" autocomplete="new-password" maxlength="128" [placeholder]="'auth.register.password' | translate" />
              <button mat-icon-button matSuffix (click)="togglePasswordVisibility($event)" type="button">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                {{ 'auth.validation.passwordRequired' | translate }}
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                {{ 'auth.validation.passwordMin' | translate }}
              </mat-error>
              <mat-error *ngIf="registerForm.get('password')?.hasError('pattern')">
                {{ 'auth.validation.passwordWeak' | translate }}
              </mat-error>
            </mat-form-field>
            <!-- Confirm Password -->
            <mat-form-field appearance="outline" class="form-field">
              <input matInput [type]="hideConfirmPassword() ? 'password' : 'text'" formControlName="confirmPassword" autocomplete="new-password" maxlength="128" [placeholder]="'auth.register.confirmPassword' | translate" />
              <button mat-icon-button matSuffix (click)="toggleConfirmPasswordVisibility($event)" type="button">
                <mat-icon>{{ hideConfirmPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                {{ 'auth.validation.confirmPasswordRequired' | translate }}
              </mat-error>
              <mat-error *ngIf="registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched">
                {{ 'auth.validation.passwordMismatch' | translate }}
              </mat-error>
            </mat-form-field>
            <!-- Submit Button -->
            <button mat-raised-button color="primary" type="submit" [disabled]="registerForm.invalid || loading()" class="btn-submit">
              <span *ngIf="!loading()">{{ 'auth.register.submit' | translate }}</span>
              <span *ngIf="loading()">{{ 'auth.register.loading' | translate }}</span>
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions class="register-actions">
          <p class="login-prompt">
            {{ 'auth.register.hasAccount' | translate }}
            <a routerLink="/auth/login" class="login-link">{{ 'auth.register.login' | translate }}</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: calc(100vh - var(--navbar-height) - 100px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-xl);
      background: linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-2) 100%);
    }
    .register-card {
      width: 100%;
      max-width: 500px;
      padding: var(--space-xl) !important;
      border: none !important;
      background: var(--color-white) !important;
    }
    .register-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: var(--space-xl);
      padding: 0 !important;
      .logo-wrapper {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        margin-bottom: var(--space-md);
        .logo-image {
          width: 180px;
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
    .register-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-sm);
      @media (min-width: 480px) {
        grid-template-columns: 1fr 1fr;
      }
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
      ::ng-deep .mat-mdc-form-field-error {
        display: block;
        color: var(--color-error);
        font-size: 12px;
        line-height: 1.4;
        white-space: normal;
      }
    }
    .btn-submit {
      margin-top: var(--space-sm);
      height: 48px;
      font-size: var(--font-size-md) !important;
    }
    .register-actions {
      display: flex;
      justify-content: center;
      margin-top: var(--space-xl) !important;
      padding: 0 !important;
      .login-prompt {
        font-size: var(--font-size-sm);
        color: var(--color-text-2);
        .login-link {
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
    [dir="rtl"] .register-container {
      mat-card-title, mat-card-subtitle, .login-prompt {
        font-family: var(--font-arabic);
      }
    }
  `],
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  registerForm!: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  alert = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(30)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
      ]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  togglePasswordVisibility(event: MouseEvent): void {
    event.preventDefault();
    this.hidePassword.update(v => !v);
  }
  toggleConfirmPasswordVisibility(event: MouseEvent): void {
    event.preventDefault();
    this.hideConfirmPassword.update(v => !v);
  }
  onSubmit(): void {
    if (this.registerForm.invalid) return;
    this.alert.set(null);
    this.loading.set(true);
    const firstName = String(this.registerForm.value.firstName || '').trim();
    const lastName = String(this.registerForm.value.lastName || '').trim();
    const email = String(this.registerForm.value.email || '').trim().toLowerCase();
    const phone = String(this.registerForm.value.phone || '').trim();
    const password = String(this.registerForm.value.password || '');
    this.authService.register({ firstName, lastName, email, phone, password }).subscribe({
      next: () => {
        this.loading.set(false);
        // The API returns and stores a valid session at registration time, so
        // sending the user back to the guest-only login page causes a redirect
        // that looks like a failed login.
        this.toastService.success('Registration successful! Welcome to Med Bridge Academy.');
        this.router.navigate(['/dashboard/my-courses']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.errorCode === 'EMAIL_EXISTS'
          ? 'An account with this email already exists. Please sign in instead.'
          : (err.error?.message || 'Registration could not be completed. Please check your details.');
        this.alert.set({ type: 'error', message });
        this.toastService.error(message);
      },
    });
  }
}
