import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { CourseService } from '../../../core/services/course.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Course } from '../../../core/models/course.model';
import { CourseCardComponent } from '../../../shared/course-card/course-card.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    NgIf,
    NgFor,
    CourseCardComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule
  ],
  template: `
    <div class="courses-page animate-fade-in">
      <!-- Header -->
      <section class="courses-header section">
        <div class="container text-center">
          <h1 class="courses-header__title">{{ 'courses.title' | translate }}</h1>
          <p class="courses-header__subtitle">{{ 'courses.subtitle' | translate }}</p>
        </div>
      </section>
      <!-- Filters & Search -->
      <section class="filters-section">
        <div class="container filters-wrapper card">
          <div class="search-field">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'courses.search' | translate }}</mat-label>
              <input matInput [formControl]="searchControl" />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
          <div class="filter-fields">
            <mat-form-field appearance="outline">
              <mat-label>{{ 'courses.category' | translate }}</mat-label>
              <mat-select [formControl]="categoryControl">
                <mat-option value="">{{ 'courses.all' | translate }}</mat-option>
                <mat-option *ngFor="let cat of categories()" [value]="cat">{{ cat }}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>
      </section>
      <!-- Courses Grid -->
      <section class="courses-grid-section section">
        <div class="container">
          <div *ngIf="loading()" class="grid grid-3">
            <div class="skeleton-card skeleton" style="height: 400px; border-radius: var(--radius-lg);" *ngFor="let i of [1,2,3,4,5,6]"></div>
          </div>
          <div *ngIf="!loading() && courses().length === 0" class="empty-state card">
            <mat-icon class="empty-icon">search_off</mat-icon>
            <h3>{{ 'courses.noResults' | translate }}</h3>
            <p>{{ 'courses.noResultsDesc' | translate }}</p>
            <button mat-raised-button color="primary" (click)="resetFilters()">
              Reset Filters
            </button>
          </div>
          <div *ngIf="!loading() && courses().length > 0" class="grid grid-3">
            <app-course-card
              *ngFor="let course of courses()"
              [course]="course"
              [isWishlisted]="isWishlisted(course.id)"
              [isEnrolled]="isEnrolled(course.id)"
              (wishlistToggle)="onWishlistToggle($event)"
              (enrollTrigger)="onEnroll($event)"
            />
          </div>
          <!-- Pagination -->
          <div *ngIf="!loading() && totalCourses() > 0" class="pagination-wrapper card">
            <mat-paginator
              [length]="totalCourses()"
              [pageSize]="pageSize()"
              [pageSizeOptions]="[3, 6, 9, 12]"
              [pageIndex]="pageIndex()"
              (page)="onPageChange($event)"
            />
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .courses-header {
      background: linear-gradient(135deg, var(--color-primary-xlight) 0%, #ffffff 100%);
      padding: var(--space-xl) 0;
      &__title {
        font-size: clamp(var(--font-size-3xl), 4vw, var(--font-size-5xl));
        font-weight: 800;
        color: var(--color-dark);
        margin-bottom: var(--space-xs);
      }
      &__subtitle {
        font-size: var(--font-size-md);
        color: var(--color-muted);
        max-width: 600px;
        margin: 0 auto;
      }
    }
    .filters-section {
      margin-top: calc(var(--space-xl) * -1);
      position: relative;
      z-index: 10;
    }
    .filters-wrapper {
      background: var(--color-white);
      padding: var(--space-lg) var(--space-xl) !important;
      display: grid;
      grid-template-columns: minmax(0, 2fr) minmax(200px, 1fr);
      gap: var(--space-md);
      border: none !important;
      align-items: center;
      border-radius: var(--radius-xl) !important;
      box-shadow: var(--shadow-md);
      mat-form-field { width: 100%; }
      ::ng-deep .mat-mdc-text-field-wrapper {
        border-radius: var(--radius-md) !important;
        background: var(--color-bg) !important;
        border: 1px solid var(--color-border-dark) !important;
      }
      // Use a single border so the search and category fields are rounded on all sides.
      ::ng-deep .mdc-notched-outline {
        display: none;
      }
      ::ng-deep .mdc-floating-label {
        padding: 0 4px;
        background: var(--color-bg);
      }
      ::ng-deep .mat-mdc-text-field-wrapper.mdc-text-field--focused {
        border-color: var(--color-primary) !important;
        box-shadow: 0 0 0 3px rgba(77, 90, 42, 0.12);
      }
      @media (max-width: 767px) {
        grid-template-columns: 1fr;
        padding: var(--space-md) !important;
      }
    }
    .courses-grid-section {
      padding-top: var(--space-xl);
    }
    .pagination-wrapper {
      margin-top: var(--space-2xl);
      overflow: hidden;
      border: none !important;
      background: var(--color-white) !important;
      border-radius: var(--radius-xl) !important;
      .mat-mdc-paginator { background: transparent; }
      ::ng-deep .mat-mdc-paginator-page-size-select .mat-mdc-text-field-wrapper {
        border-radius: var(--radius-md) !important;
        border: 1px solid var(--color-border-dark) !important;
        background: var(--color-bg) !important;
      }
      // The paginator select has no floating label, so a single border is cleaner
      // and avoids visible seams between Material's outline segments.
      ::ng-deep .mat-mdc-paginator-page-size-select .mdc-notched-outline {
        display: none;
      }
    }
    [dir="rtl"] .courses-page {
      .courses-header__title, .courses-header__subtitle, h3, p {
        font-family: var(--font-arabic);
      }
    }
  `],
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);
  private wishlistService = inject(WishlistService);
  private enrollmentService = inject(EnrollmentService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  courses = signal<Course[]>([]);
  categories = signal<string[]>(['Surgery', 'Emergency Medicine', 'Ophthalmology', 'Cardiology', 'Radiology']);
  loading = signal(true);
  
  searchControl = new FormControl('');
  categoryControl = new FormControl('');
  wishlistedIds = signal<string[]>([]);
  enrolledIds = signal<string[]>([]);
  // Pagination state
  totalCourses = signal(0);
  pageSize = signal(6);
  pageIndex = signal(0);
  ngOnInit(): void {
    this.loadCourses();
    this.loadUserData();
    // Search and Category filters change events
    this.searchControl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe(() => {
        this.pageIndex.set(0);
        this.loadCourses();
      });
    this.categoryControl.valueChanges.subscribe(() => {
      this.pageIndex.set(0);
      this.loadCourses();
    });
  }
  loadCourses(): void {
    this.loading.set(true);
    const search = this.searchControl.value || undefined;
    const category = this.categoryControl.value || undefined;
    this.courseService.getCourses({
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
      search,
      category,
    }).subscribe({
      next: (res) => {
        this.courses.set(res.data.courses);
        this.totalCourses.set(res.data.total);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
  loadUserData(): void {
    if (this.authService.isAuthenticated()) {
      this.wishlistService.getWishlist().subscribe({
        next: (res) => {
          this.wishlistedIds.set(res.data.map((item: any) => item.courseId));
        },
      });
      this.enrollmentService.getMyEnrollments().subscribe({
        next: (res) => {
          this.enrolledIds.set(res.data.map((item: any) => item.courseId));
        },
      });
    }
  }
  isWishlisted(courseId: string): boolean {
    return this.wishlistedIds().includes(courseId);
  }
  isEnrolled(courseId: string): boolean {
    return this.enrolledIds().includes(courseId);
  }
  onWishlistToggle(courseId: string): void {
    if (!this.authService.isAuthenticated()) {
      this.toastService.warning('Please login to manage your wishlist');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/courses' } });
      return;
    }
    if (this.isWishlisted(courseId)) {
      this.wishlistService.removeFromWishlist(courseId).subscribe({
        next: () => {
          this.wishlistedIds.update(ids => ids.filter(id => id !== courseId));
          this.toastService.success('Removed from wishlist');
        },
      });
    } else {
      this.wishlistService.addToWishlist(courseId).subscribe({
        next: () => {
          this.wishlistedIds.update(ids => [...ids, courseId]);
          this.toastService.success('Added to wishlist');
        },
      });
    }
  }
  onEnroll(course: Course): void {
    if (!this.authService.isAuthenticated()) {
      this.toastService.warning('Please login to enroll in courses');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: `/courses/${course.id}` } });
      return;
    }
    this.router.navigate(['/courses', course.id]);
  }
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.loadCourses();
  }
  resetFilters(): void {
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
  }
}
