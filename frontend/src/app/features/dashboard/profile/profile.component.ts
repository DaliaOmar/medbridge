import { Component, OnInit, inject, signal } from '@angular/core';
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
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, NgIf, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="profile-page animate-fade-in">
      <div class="header-row">
        <h2>{{ 'dashboard.profile.title' | translate }}</h2>
      </div>
      <div class="grid grid-2" style="align-items: start;">
        <!-- Profile Info Form -->
        <mat-card class="profile-card card">
          <mat-card-header>
            <mat-card-title>{{ 'dashboard.profile.updateAccountDetails' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()" class="profile-form">
              <div class="form-row">
                <div class="form-field">
                  <label for="firstName">{{ 'dashboard.profile.firstName' | translate }}</label>
                  <input id="firstName" class="profile-input" formControlName="firstName" />
                </div>
                <div class="form-field">
                  <label for="lastName">{{ 'dashboard.profile.lastName' | translate }}</label>
                  <input id="lastName" class="profile-input" formControlName="lastName" />
                </div>
              </div>
              <div class="form-field">
                <label for="email">{{ 'dashboard.profile.email' | translate }}</label>
                <input id="email" class="profile-input" type="email" formControlName="email" readonly />
              </div>
              <div class="form-field">
                <label for="phone">{{ 'dashboard.profile.phone' | translate }}</label>
                <input id="phone" class="profile-input" formControlName="phone" />
              </div>
              <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || savingProfile()" class="btn-submit">
                {{ 'dashboard.profile.save' | translate }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>
        <!-- Password Change Form -->
        <mat-card class="profile-card card">
          <mat-card-header>
            <mat-card-title>{{ 'dashboard.profile.changePassword' | translate }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="profile-form">
              <div class="form-field">
                <label for="currentPassword">{{ 'dashboard.profile.currentPassword' | translate }}</label>
                <input id="currentPassword" class="profile-input" type="password" formControlName="currentPassword" />
              </div>
              <div class="form-field">
                <label for="newPassword">{{ 'dashboard.profile.newPassword' | translate }}</label>
                <input id="newPassword" class="profile-input" type="password" formControlName="newPassword" />
              </div>
              <div class="form-field">
                <label for="confirmPassword">{{ 'dashboard.profile.confirmPassword' | translate }}</label>
                <input id="confirmPassword" class="profile-input" type="password" formControlName="confirmPassword" />
                <span class="field-error" *ngIf="passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.touched">
                  Passwords do not match
                </span>
              </div>
              <button mat-raised-button color="primary" type="submit" [disabled]="passwordForm.invalid || savingPassword()" class="btn-submit">
                {{ 'dashboard.profile.changePassword' | translate }}
              </button>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: var(--space-xl) 0;
      .header-row {
        margin-bottom: var(--space-xl);
        margin-right: var(--space-xl);
        margin-left: var(--space-xl);
        h2 { font-size: var(--font-size-2xl); font-weight: 800; }
      }
    }
    .profile-card {
      border: none !important;
      background: var(--color-white) !important;
      padding: var(--space-lg) !important;
      mat-card-title {
        font-size: var(--font-size-lg) !important;
        font-weight: 700 !important;
        color: var(--color-dark);
        margin-bottom: var(--space-lg) !important;
      }
    }
    .profile-form {
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
      display: flex;
      flex-direction: column;
      gap: 7px;

      label {
        color: var(--color-text-2);
        font-size: var(--font-size-sm);
        font-weight: 600;
      }
    }
    .profile-input {
      width: 100%;
      height: 52px;
      padding: 0 14px;
      border: 1px solid var(--color-border-dark);
      border-radius: var(--radius-md);
      outline: 0;
      background: var(--color-white);
      color: var(--color-dark);
      font: inherit;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      box-sizing: border-box;

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(77, 90, 42, 0.12);
      }
      &:read-only { background: var(--color-bg); color: var(--color-muted); }
    }
    .field-error { color: var(--color-error); font-size: var(--font-size-xs); }
    .btn-submit { height: 44px; margin-top: var(--space-sm); }
    [dir="rtl"] .profile-page {
      h2, mat-card-title, label, input, button {
        font-family: var(--font-arabic);
      }
    }
  `],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  
  savingProfile = signal(false);
  savingPassword = signal(false);
  ngOnInit(): void {
    const user = this.authService.currentUser();
    this.profileForm = this.fb.group({
      firstName: [user?.firstName || '', Validators.required],
      lastName: [user?.lastName || '', Validators.required],
      email: [user?.email || ''],
      phone: [user?.phone || ''],
    });
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.passwordMatchValidator });
  }
  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
  onSaveProfile(): void {
    if (this.profileForm.invalid) return;
    this.savingProfile.set(true);
    const { firstName, lastName, phone } = this.profileForm.value;
    this.authService.updateProfile({ firstName, lastName, phone }).subscribe({
      next: (res) => {
        this.savingProfile.set(false);
        this.toastService.success('dashboard.profile.updateSuccess');
      },
      error: (err) => {
        this.savingProfile.set(false);
        this.toastService.error(err.error?.message || 'Failed to update profile');
      },
    });
  }
  onChangePassword(): void {
    if (this.passwordForm.invalid) return;
    this.savingPassword.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordForm.reset();
        this.toastService.success('dashboard.profile.passwordSuccess');
      },
      error: (err) => {
        this.savingPassword.set(false);
        this.toastService.error(err.error?.message || 'Failed to change password');
      },
    });
  }
}
