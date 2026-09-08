import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslateModule,
    NgClass,
    NgIf,
    MatMenuModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <nav class="navbar" [ngClass]="{ 'navbar--scrolled': isScrolled() }">
      <div class="navbar__container">
        <!-- Logo -->
        <a routerLink="/" class="navbar__logo">
          <img src="assets/med-bridge-logo.png" alt="Med Bridge Academy" class="navbar__logo-image" />
        </a>
        <!-- Desktop Menu -->
        <div class="navbar__menu hide-mobile">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="navbar__link">
            {{ 'nav.home' | translate }}
          </a>
          <a routerLink="/courses" routerLinkActive="active" class="navbar__link">
            {{ 'nav.courses' | translate }}
          </a>
          <!-- Admin Panel Link -->
          <a *ngIf="isAdmin()" routerLink="/admin" routerLinkActive="active" class="navbar__link navbar__link--admin">
            <mat-icon>admin_panel_settings</mat-icon>
            {{ 'nav.admin' | translate }}
          </a>
        </div>
        <!-- Right Side Actions -->
        <div class="navbar__actions hide-mobile">
          <!-- Language Switcher -->
          <button mat-button class="lang-switch-btn" (click)="toggleLanguage()">
            <mat-icon>translate</mat-icon>
            <span>{{ currentLang() === 'en' ? 'العربية' : 'English' }}</span>
          </button>
          <!-- Auth Buttons -->
          <ng-container *ngIf="currentUser(); else guestButtons">
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-profile-btn">
              <mat-icon>account_circle</mat-icon>
              <span class="user-name">{{ currentUser()?.firstName }}</span>
              <mat-icon>arrow_drop_down</mat-icon>
            </button>
            <mat-menu #userMenu="matMenu" xPosition="before" class="custom-menu">
              <a mat-menu-item routerLink="/dashboard/my-courses">
                <mat-icon>school</mat-icon>
                <span>{{ 'nav.myCourses' | translate }}</span>
              </a>
              <a mat-menu-item routerLink="/dashboard/wishlist">
                <mat-icon>favorite</mat-icon>
                <span>{{ 'nav.wishlist' | translate }}</span>
              </a>
              <a mat-menu-item routerLink="/dashboard/profile">
                <mat-icon>person</mat-icon>
                <span>{{ 'nav.profile' | translate }}</span>
              </a>
              <hr class="menu-divider" />
              <button mat-menu-item (click)="logout()">
                <mat-icon color="warn">exit_to_app</mat-icon>
                <span class="text-danger">{{ 'nav.logout' | translate }}</span>
              </button>
            </mat-menu>
          </ng-container>
          <ng-template #guestButtons>
            <a routerLink="/auth/login" class="btn btn--ghost btn--sm">
              {{ 'nav.login' | translate }}
            </a>
            <a routerLink="/auth/register" class="btn btn--primary btn--sm">
              {{ 'nav.register' | translate }}
            </a>
          </ng-template>
        </div>
        <!-- Mobile Menu Toggle Button -->
        <button mat-icon-button class="navbar__toggle hide-desktop" (click)="toggleMobileMenu()">
          <mat-icon>{{ isMobileMenuOpen() ? 'close' : 'menu' }}</mat-icon>
        </button>
      </div>
      <!-- Mobile Dropdown Menu -->
      <div class="navbar__mobile-menu hide-desktop" [ngClass]="{ 'navbar__mobile-menu--open': isMobileMenuOpen() }">
        <a routerLink="/" (click)="closeMobileMenu()" class="navbar__mobile-link">
          {{ 'nav.home' | translate }}
        </a>
        <a routerLink="/courses" (click)="closeMobileMenu()" class="navbar__mobile-link">
          {{ 'nav.courses' | translate }}
        </a>
        
        <ng-container *ngIf="currentUser(); else guestMobile">
          <a *ngIf="isAdmin()" routerLink="/admin" (click)="closeMobileMenu()" class="navbar__mobile-link navbar__mobile-link--admin">
            <mat-icon>admin_panel_settings</mat-icon>
            {{ 'nav.admin' | translate }}
          </a>
          <a routerLink="/dashboard/my-courses" (click)="closeMobileMenu()" class="navbar__mobile-link">
            {{ 'nav.myCourses' | translate }}
          </a>
          <a routerLink="/dashboard/wishlist" (click)="closeMobileMenu()" class="navbar__mobile-link">
            {{ 'nav.wishlist' | translate }}
          </a>
          <a routerLink="/dashboard/profile" (click)="closeMobileMenu()" class="navbar__mobile-link">
            {{ 'nav.profile' | translate }}
          </a>
          <button (click)="logoutMobile()" class="navbar__mobile-link text-danger logout-btn">
            <mat-icon>exit_to_app</mat-icon>
            {{ 'nav.logout' | translate }}
          </button>
        </ng-container>
        <ng-template #guestMobile>
          <a routerLink="/auth/login" (click)="closeMobileMenu()" class="navbar__mobile-link">
            {{ 'nav.login' | translate }}
          </a>
          <a routerLink="/auth/register" (click)="closeMobileMenu()" class="navbar__mobile-link navbar__mobile-link--highlight">
            {{ 'nav.register' | translate }}
          </a>
        </ng-template>
        <hr class="mobile-divider" />
        <button (click)="toggleLanguageMobile()" class="navbar__mobile-link lang-btn">
          <mat-icon>translate</mat-icon>
          {{ currentLang() === 'en' ? 'العربية' : 'English' }}
        </button>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: var(--navbar-height);
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--color-border);
      z-index: 1000;
      transition: all var(--transition-base);
      &--scrolled {
        background: rgba(255, 255, 255, 0.95);
        box-shadow: var(--shadow-sm);
      }
      &__container {
        max-width: 1280px;
        height: 100%;
        margin: 0 auto;
        padding: 0 var(--space-md);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      &__logo {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        text-decoration: none;
        color: var(--color-primary);
        &-image {
          height: 44px;
          width: auto;
          display: block;
        }
      }
      &__menu {
        display: flex;
        align-items: center;
        gap: var(--space-lg);
      }
      &__link {
        font-weight: 600;
        color: var(--color-text-2);
        padding: var(--space-xs) 0;
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--color-primary);
          transition: width var(--transition-fast);
        }
        &:hover {
          color: var(--color-primary);
          &::after { width: 100%; }
        }
        &.active {
          color: var(--color-primary);
          &::after { width: 100%; }
        }
        &--admin {
          color: var(--color-secondary-dark);
          &::after { background: var(--color-secondary-dark); }
          &:hover { color: var(--color-secondary-light); }
        }
      }
      &__actions {
        display: flex;
        align-items: center;
        gap: var(--space-md);
      }
      &__toggle {
        color: var(--color-dark);
      }
      &__mobile-menu {
        position: fixed;
        top: var(--navbar-height);
        left: 0;
        width: 100%;
        background: var(--color-white);
        border-bottom: 1px solid var(--color-border);
        box-shadow: var(--shadow-lg);
        padding: var(--space-lg);
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
        transform: translateY(-150%);
        transition: transform var(--transition-base);
        z-index: 999;
        &--open {
          transform: translateY(0);
        }
      }
      &__mobile-link {
        font-weight: 600;
        color: var(--color-text);
        padding: var(--space-xs) 0;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        border-bottom: 1px solid var(--color-bg);
        &--highlight {
          color: var(--color-primary);
        }
        &--admin {
          color: var(--color-secondary-dark);
        }
        &.lang-btn, &.logout-btn {
          border: none;
          background: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
          font-size: inherit;
          [dir="rtl"] & {
            text-align: right;
          }
        }
      }
    }
    [dir="rtl"] .navbar {
      &__mobile-link {
        font-family: var(--font-arabic);
      }
    }
    .lang-switch-btn {
      font-weight: 600 !important;
      color: var(--color-text-2) !important;
    }
    .user-profile-btn {
      font-weight: 600 !important;
      color: var(--color-primary) !important;
      background: var(--color-primary-xlight) !important;
      border-radius: var(--radius-full) !important;
    }
    .menu-divider {
      border: none;
      border-top: 1px solid var(--color-border);
      margin: var(--space-xs) 0;
    }
    .mobile-divider {
      border: none;
      border-top: 1px solid var(--color-border);
      margin: var(--space-xs) 0;
    }
  `],
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private languageService = inject(LanguageService);
  currentUser = this.authService.currentUser;
  currentLang = this.languageService.currentLang;
  
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScroll);
    }
  }
  onScroll = () => {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 20);
    }
  };
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }
  toggleLanguage(): void {
    const nextLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.languageService.changeLanguage(nextLang);
  }
  toggleLanguageMobile(): void {
    this.toggleLanguage();
    this.closeMobileMenu();
  }
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
  logoutMobile(): void {
    this.logout();
    this.closeMobileMenu();
  }
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }
  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
