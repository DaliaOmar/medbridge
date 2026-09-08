import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, MatIconModule, MatButtonModule],
  template: `
    <div class="admin-layout animate-fade-in" [class.sidebar-is-open]="sidebarOpen()">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar" [class.open]="sidebarOpen()">
        <div class="sidebar-header">
          <mat-icon>healing</mat-icon>
          <span>MBA Admin</span>
          <button mat-icon-button type="button" class="sidebar-close" (click)="toggleSidebar()"
            [attr.aria-label]="'admin.nav.closeSidebar' | translate"
            [title]="'admin.nav.closeSidebar' | translate">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin/overview" routerLinkActive="active" class="nav-item">
            <mat-icon>dashboard</mat-icon>
            <span>{{ 'admin.nav.overview' | translate }}</span>
          </a>
          <a routerLink="/admin/courses" routerLinkActive="active" class="nav-item">
            <mat-icon>school</mat-icon>
            <span>{{ 'admin.nav.courses' | translate }}</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <mat-icon>people</mat-icon>
            <span>{{ 'admin.nav.users' | translate }}</span>
          </a>
          <a routerLink="/admin/enrollments" routerLinkActive="active" class="nav-item">
            <mat-icon>receipt_long</mat-icon>
            <span>{{ 'admin.nav.enrollments' | translate }}</span>
          </a>
          <a routerLink="/admin/coupons" routerLinkActive="active" class="nav-item">
            <mat-icon>sell</mat-icon>
            <span>{{ 'admin.nav.coupons' | translate }}</span>
          </a>
          <a routerLink="/admin/academy-settings" routerLinkActive="active" class="nav-item">
            <mat-icon>settings</mat-icon>
            <span>{{ 'admin.nav.academyInfo' | translate }}</span>
          </a>
          <hr class="nav-divider" />
          <a routerLink="/" class="nav-item back-to-site">
            <mat-icon>arrow_back</mat-icon>
            <span>{{ 'admin.nav.backToSite' | translate }}</span>
          </a>
        </nav>
      </aside>
      <!-- Admin Main Content -->
      <main class="admin-content">
        <header class="admin-header">
          <div class="header-container">
            <div class="header-title">
              <button mat-icon-button type="button" class="sidebar-toggle" (click)="toggleSidebar()"
                [attr.aria-label]="(sidebarOpen() ? 'admin.nav.closeSidebar' : 'admin.nav.openSidebar') | translate"
                [title]="(sidebarOpen() ? 'admin.nav.closeSidebar' : 'admin.nav.openSidebar') | translate">
                <mat-icon>{{ sidebarOpen() ? 'menu_open' : 'menu' }}</mat-icon>
              </button>
              <span class="page-title">{{ 'admin.nav.dashboard' | translate }}</span>
            </div>
            <div class="user-meta">
              <span>{{ 'admin.nav.welcome' | translate }}, {{ currentUser()?.firstName }}</span>
              <button mat-icon-button (click)="logout()"><mat-icon>exit_to_app</mat-icon></button>
            </div>
          </div>
        </header>
        <div class="admin-page-container container">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: var(--color-bg);
      [dir="rtl"] & { flex-direction: row-reverse; }
    }
    .admin-sidebar {
      width: 0;
      flex: 0 0 0;
      background: var(--color-dark);
      color: var(--color-white);
      position: relative;
      overflow: hidden;
      transform: translateX(-100%);
      transition: width var(--transition-base), flex-basis var(--transition-base), transform var(--transition-base);
      &.open {
        width: var(--sidebar-width);
        flex-basis: var(--sidebar-width);
        transform: translateX(0);
      }
      [dir="rtl"] & { transform: translateX(100%); }
      [dir="rtl"] &.open { transform: translateX(0); }
    }
    .sidebar-header {
      height: var(--navbar-height);
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 0 var(--space-lg);
      font-weight: 800;
      font-size: var(--font-size-xl);
      border-bottom: 1px solid var(--color-dark-2);
      mat-icon {
        color: var(--color-primary-light);
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }
    .sidebar-nav {
      padding: var(--space-md);
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: 12px var(--space-md);
      color: var(--color-text-3);
      text-decoration: none;
      font-weight: 600;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
      &:hover {
        color: var(--color-white);
        background: rgba(255, 255, 255, 0.05);
      }
      &.active {
        color: var(--color-white);
        background: var(--color-primary);
      }
    }
    .nav-divider {
      border: none;
      border-top: 1px solid var(--color-dark-2);
      margin: var(--space-md) 0;
    }
    .back-to-site {
      color: var(--color-secondary-light);
      &:hover {
        background: rgba(201, 162, 39, 0.1);
      }
    }
    .admin-content {
      margin-left: 0;
      flex: 1;
      min-width: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .sidebar-close {
      margin-inline-start: auto;
      color: var(--color-text-3);
      &:hover { color: var(--color-white); }
      mat-icon { color: currentColor; font-size: 20px; width: 20px; height: 20px; }
    }
    .admin-header {
      height: var(--navbar-height);
      background: var(--color-white);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 900;
      padding: 0 var(--space-lg);
      .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
      }
      .header-title { display: flex; align-items: center; gap: var(--space-sm); }
      .sidebar-toggle { color: var(--color-primary); }
      .page-title {
        font-weight: 700;
        font-size: var(--font-size-lg);
        color: var(--color-dark);
      }
      .user-meta {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        font-weight: 600;
        color: var(--color-text-2);
      }
    }
    .admin-page-container {
      flex-grow: 1;
      padding-top: var(--space-xl);
      padding-bottom: var(--space-3xl);
    }
    @media (max-width: 900px) {
      .admin-sidebar {
        width: 220px;
        flex-basis: 220px;
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        z-index: 1000;
        overflow-y: auto;
      }
      [dir="rtl"] .admin-sidebar { left: auto; right: 0; }
      [dir="rtl"] .admin-sidebar.open { transform: translateX(0); }
    }
    @media (max-width: 700px) {
      .admin-header { padding: 0 12px; }
      .admin-header .page-title { font-size: var(--font-size-md); }
      .admin-header .user-meta span { display: none; }
      .admin-page-container { padding: 16px 10px 32px; }
    }
  `],
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  currentUser = this.authService.currentUser;
  sidebarOpen = signal(true);

  toggleSidebar(): void {
    this.sidebarOpen.update(open => !open);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
