import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { WishlistService } from '../../../core/services/wishlist.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { CourseCardComponent } from '../../../shared/course-card/course-card.component';
import { ToastService } from '../../../core/services/toast.service';
import { Course } from '../../../core/models/course.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, TranslateModule, NgIf, NgFor, CourseCardComponent, MatIconModule, MatButtonModule],
  template: `
    <div class="wishlist-page animate-fade-in">
      <div class="header-row">
        <h2>{{ 'dashboard.wishlist.title' | translate }}</h2>
      </div>
      <div *ngIf="loading()" class="loading-state">
        <div class="grid grid-3">
          <div class="skeleton-card skeleton" style="height: 400px; border-radius: var(--radius-lg);" *ngFor="let i of [1,2,3]"></div>
        </div>
      </div>
      <div *ngIf="!loading() && wishlistItems().length === 0" class="empty-state card">
        <mat-icon class="empty-icon">favorite_border</mat-icon>
        <h3>{{ 'dashboard.wishlist.empty' | translate }}</h3>
        <p>{{ 'dashboard.wishlist.emptyDesc' | translate }}</p>
        <a routerLink="/courses" mat-raised-button color="primary">
          {{ 'dashboard.wishlist.browseCourses' | translate }}
        </a>
      </div>
      <div *ngIf="!loading() && wishlistItems().length > 0" class="grid grid-3">
        <app-course-card
          *ngFor="let item of wishlistItems()"
          [course]="item.course"
          [isWishlisted]="true"
          [isEnrolled]="isEnrolled(item.course.id)"
          (wishlistToggle)="onRemove($event)"
          (enrollTrigger)="onEnroll($event)"
        />
      </div>
    </div>
  `,
  styles: [`
    .wishlist-page {
      padding: var(--space-xl) 0;
      .header-row {
        margin-bottom: var(--space-xl);
        margin-left: var(--space-xl);
        margin-right: var(--space-xl);
        h2 { font-size: var(--font-size-2xl); font-weight: 800; }
      }
    }
    [dir="rtl"] .wishlist-page {
      h2, h3, p {
        font-family: var(--font-arabic);
      }
    }
  `],
})
export class WishlistComponent implements OnInit {
  private wishlistService = inject(WishlistService);
  private enrollmentService = inject(EnrollmentService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  wishlistItems = signal<any[]>([]);
  enrolledIds = signal<string[]>([]);
  loading = signal(true);
  ngOnInit(): void {
    this.loadWishlist();
    this.loadEnrolledCourses();
  }
  loadWishlist(): void {
    this.loading.set(true);
    this.wishlistService.getWishlist().subscribe({
      next: (res) => {
        this.wishlistItems.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
  loadEnrolledCourses(): void {
    this.enrollmentService.getMyEnrollments().subscribe({
      next: (res) => {
        this.enrolledIds.set(res.data.map((item: any) => item.courseId));
      },
    });
  }
  isEnrolled(courseId: string): boolean {
    return this.enrolledIds().includes(courseId);
  }
  onRemove(courseId: string): void {
    this.wishlistService.removeFromWishlist(courseId).subscribe({
      next: () => {
        this.wishlistItems.update(items => items.filter(item => item.courseId !== courseId));
        this.toastService.success('Removed from wishlist');
      },
    });
  }
  onEnroll(course: Course): void {
    this.router.navigate(['/courses', course.id]);
  }
}
