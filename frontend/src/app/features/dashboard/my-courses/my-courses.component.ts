import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { NgIf, NgFor, NgClass, DatePipe, DecimalPipe } from '@angular/common';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { LanguageService } from '../../../core/services/language.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../core/services/toast.service';
@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [RouterLink, TranslateModule, NgIf, NgFor, NgClass, DatePipe, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="my-courses animate-fade-in">
      <div class="header-row">
        <h2>{{ 'dashboard.myCourses.title' | translate }}</h2>
      </div>
      <div *ngIf="loading()" class="loading-state">
        <div class="skeleton-list skeleton" style="height: 100px; margin-bottom: 16px;" *ngFor="let i of [1,2,3]"></div>
      </div>
      <div *ngIf="!loading() && enrollments().length === 0" class="empty-state card">
        <mat-icon class="empty-icon">school</mat-icon>
        <h3>{{ 'dashboard.myCourses.empty' | translate }}</h3>
        <p>{{ 'dashboard.myCourses.emptyDesc' | translate }}</p>
        <a routerLink="/courses" mat-raised-button color="primary">
          {{ 'dashboard.myCourses.browseCourses' | translate }}
        </a>
      </div>
      <div *ngIf="!loading() && enrollments().length > 0" class="enrollments-list">
        <div class="enrollment-item card" *ngFor="let item of enrollments()">
          <div class="course-thumbnail">
            <img [src]="item.course.image || 'assets/images/placeholder.jpg'" [alt]="getCourseTitle(item)" />
          </div>
          <div class="course-details">
            <span class="category-badge badge badge--primary">{{ item.course.category }}</span>
            <h3>{{ getCourseTitle(item) }}</h3>
            <div class="enrollment-meta">
              <span class="meta-item">
                <mat-icon>calendar_today</mat-icon>
                {{ 'dashboard.myCourses.enrolledOn' | translate }}: {{ item.enrolledAt | date:'mediumDate' }}
              </span>
              <span class="meta-item">
                <mat-icon>payments</mat-icon>
                {{ 'dashboard.myCourses.pricePaid' | translate }}: {{ item.pricePaid | number:'1.2-2' }} EGP
              </span>
              <span class="meta-item" *ngIf="item.couponUsed">
                <mat-icon>sell</mat-icon>
                {{ 'dashboard.myCourses.couponUsed' | translate }}: {{ item.couponUsed }}
              </span>
            </div>
          </div>
          <div class="course-actions">
          <button *ngIf="canCancel(item)" type="button" mat-icon-button class="cancel-enrollment-btn" (click)="cancelEnrollment(item)"
          [attr.aria-label]="'dashboard.myCourses.cancelEnrollment' | translate" [title]="'dashboard.myCourses.cancelEnrollment' | translate">
          <mat-icon>cancel</mat-icon>
        </button>
            <span class="status-indicator badge" [ngClass]="{
              'badge--success': item.status === 'CONFIRMED',
              'badge--warning': item.status === 'PENDING',
              'badge--error': item.status === 'CANCELLED'
            }">
              {{ item.status }}
            </span>
            <a [routerLink]="['/courses', item.courseId]" mat-raised-button color="primary">
              {{ 'courses.viewDetails' | translate }}
            </a>
         
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-courses {
      padding: var(--space-xl) 0;
      .header-row {
        margin-bottom: var(--space-xl);
        margin-left:var(--space-xl);
        margin-right:var(--space-xl);
        h2 { font-size: var(--font-size-2xl); font-weight: 800; }
      }
    }
    .enrollments-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-md);
    }
    .enrollment-item {
      display: flex;
      flex-direction: column;
      background: var(--color-white);
      border: none !important;
      overflow: hidden;
      @media (min-width: 768px) {
        flex-direction: row;
        height: 235px;
      }
      .course-thumbnail {
        width: 100%;
        height: 180px;
        @media (min-width: 768px) {
          width: 240px;
          height: unset;
        }
        img { width: 100%; height: 100%; object-fit: cover; }
      }
      .course-details {
        padding: var(--space-lg);
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: var(--space-xs);
        h3 {
          font-size: var(--font-size-lg);
          color: var(--color-dark);
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }
      }
      .enrollment-meta {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-md);
        margin-top: var(--space-sm);
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-muted);
          font-size: var(--font-size-xs);
          mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--color-primary); }
        }
      }
      .course-actions {
        padding: var(--space-lg);
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        border-top: 1px solid var(--color-bg);
        @media (min-width: 768px) {
          flex-direction: column;
          align-items: flex-end;
          justify-content: center;
          border-top: none;
          border-left: 1px solid var(--color-bg);
          width: 200px;
          [dir="rtl"] & {
            border-left: none;
            border-right: 1px solid var(--color-bg);
          }
        }
        .cancel-enrollment-btn {
          width: 40px;
          height: 40px;
          flex: 0 0 40px;
          background: var(--color-primary-xlight) !important;
          color: var(--color-primary-dark) !important;
          border: 1px solid var(--color-border) !important;
          border-radius: 50% !important;
          box-shadow: none;

          &:hover {
            background: var(--color-primary) !important;
            color: var(--color-white) !important;
          }

          mat-icon {
            margin: 0;
          }
        }
      }
    }
    [dir="rtl"] .my-courses {
      h2, h3, .enrollment-meta, .course-actions {
        font-family: var(--font-arabic);
      }
    }
  `],
})
export class MyCoursesComponent implements OnInit {
  private enrollmentService = inject(EnrollmentService);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  private toast = inject(ToastService);
  enrollments = signal<any[]>([]);
  loading = signal(true);
  currentLang = this.languageService.currentLang;
  ngOnInit(): void {
    this.loadMyEnrollments();
  }
  loadMyEnrollments(): void {
    this.loading.set(true);
    this.enrollmentService.getMyEnrollments().subscribe({
      next: (res) => {
        this.enrollments.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
  getCourseTitle(item: any): string {
    return this.currentLang() === 'ar' ? item.course.title_ar : item.course.title_en;
  }
  canCancel(item: any): boolean {
    const startDate = item.course?.startDate;
    return !!startDate && new Date().getTime() <= new Date(startDate).getTime() - 48 * 60 * 60 * 1000;
  }
  cancelEnrollment(item: any): void {
    if (!confirm(this.translate.instant('dashboard.myCourses.cancelConfirm'))) return;
    this.enrollmentService.cancelMyEnrollment(item.id).subscribe({
      next: () => {
        this.toast.success(this.translate.instant('dashboard.myCourses.cancelSuccess'));
        this.loadMyEnrollments();
      },
      error: (err) => this.toast.error(err.error?.message || this.translate.instant('dashboard.myCourses.cancelError')),
    });
  }
}
