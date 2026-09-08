import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor, NgClass, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { CouponService } from '../../../core/services/coupon.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { LanguageService } from '../../../core/services/language.service';
import { Course, CouponValidation } from '../../../core/models/course.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    RouterLink,
    TranslateModule,
    NgIf,
    NgFor,
    NgClass,
    FormsModule,
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  template: `
    <div class="course-detail animate-fade-in" *ngIf="course()">
      <!-- Hero Header -->
      <section class="detail-hero">
        <div class="container detail-hero__container">
          <div class="detail-hero__content">
            <span class="detail-hero__category badge badge--secondary">{{ course()?.category }}</span>
            <h1 class="detail-hero__title">{{ getTitle() }}</h1>
            <div class="detail-hero__meta">
              <span class="meta-item">
                <mat-icon>schedule</mat-icon>
                {{ course()?.duration }}
              </span>
              <span class="meta-item" *ngIf="course()?.maxStudents">
                <mat-icon>group</mat-icon>
                {{ course()?.maxStudents }} {{ 'courses.students' | translate }}
              </span>
              <span class="meta-item" *ngIf="course()?.startDate || course()?.endDate"><mat-icon>event</mat-icon>{{ courseDateRange() }}</span>
            </div>
          </div>
        </div>
      </section>
      <!-- Main Grid Layout -->
      <section class="detail-main section">
        <div class="container detail-grid">
          <!-- Course Info -->
          <div class="detail-info">
            <div class="detail-card card">
              <div class="detail-card__image-wrapper">
                <img [src]="getImageUrl()" [alt]="getTitle()" />
              </div>
              <div class="detail-card__body">
                <h2>{{ 'courses.aboutCourse' | translate }}</h2>
                <div class="desc-content">{{ getDesc() }}</div>
              </div>
            </div>
          </div>
          <!-- Checkout Sidebar -->
          <div class="detail-sidebar">
            <mat-card class="checkout-card card">
              <mat-card-content class="checkout-content">
                <div class="price-section">
                  <span class="price-label">{{ 'courses.price' | translate }}</span>
                  <div class="price-row">
                    <span class="price-original" [ngClass]="{ 'price-original--slashed': discountAmount() > 0 }">
                      {{ course()?.price | number:'1.2-2' }} EGP
                    </span>
                    <span class="price-final" *ngIf="discountAmount() > 0">
                      {{ finalPrice() | number:'1.2-2' }} EGP
                    </span>
                  </div>
                  <p class="availability-message" *ngIf="!isAvailable()">{{ availabilityLabel() | translate }}</p>
                </div>
                <!-- Wishlist Toggle -->
                <button 
                  mat-stroked-button 
                  class="btn-wishlist btn--full"
                  [ngClass]="{ 'btn-wishlist--active': isWishlisted() }"
                  (click)="onWishlistToggle()"
                >
                  <mat-icon>{{ isWishlisted() ? 'favorite' : 'favorite_border' }}</mat-icon>
                  {{ (isWishlisted() ? 'courses.removeFromWishlist' : 'courses.addToWishlist') | translate }}
                </button>
                <!-- Actions depending on enrollment status -->
                <ng-container *ngIf="isEnrolled(); else notEnrolledActions">
                  <div class="enrolled-success-alert badge badge--success">
                    <mat-icon>check_circle</mat-icon>
                    <span>{{ 'courses.enrolled' | translate }}</span>
                  </div>
                </ng-container>
                <ng-template #notEnrolledActions>
                  <!-- Coupon Field -->
                  <div class="coupon-section" *ngIf="isAuthenticated()">
                    <div class="coupon-field">
                      <input type="text" [(ngModel)]="couponCode" [disabled]="couponApplied()"
                        [placeholder]="'courses.couponCode' | translate" [attr.aria-label]="'courses.couponCode' | translate" />
                      <button type="button" class="coupon-apply-suffix" *ngIf="!couponApplied()" (click)="applyCoupon()" [disabled]="!couponCode">
                        {{ 'courses.applyCoupon' | translate }}
                      </button>
                      <button type="button" class="coupon-remove-button" *ngIf="couponApplied()" (click)="removeCoupon()"
                        [attr.aria-label]="'courses.removeCoupon' | translate" [title]="'courses.removeCoupon' | translate">
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  <p class="coupon-message error" *ngIf="couponError()">{{ couponError() }}</p>
                  <p class="coupon-message success" *ngIf="couponApplied()">
                    {{ 'courses.couponApplied' | translate }} (-{{ discountAmount() | number:'1.2-2' }} EGP)
                  </p>
                  <div class="price-summary" *ngIf="couponApplied()">
                    <div><span>{{ 'courses.originalPrice' | translate }}</span><strong>{{ course()?.price | number:'1.2-2' }} EGP</strong></div>
                    <div><span>{{ 'courses.discount' | translate }}</span><strong class="discount-value">-{{ discountAmount() | number:'1.2-2' }} EGP</strong></div>
                    <div class="summary-total"><span>{{ 'courses.total' | translate }}</span><strong>{{ finalPrice() | number:'1.2-2' }} EGP</strong></div>
                  </div>
                  </div>
                  <!-- Checkout/Enroll Button -->
                  <button 
                    *ngIf="isAuthenticated()" 
                    mat-raised-button 
                    color="primary" 
                    class="btn-checkout btn--full"
                    [disabled]="submitting() || !isAvailable()"
                    (click)="enrollInCourse()"
                  >
                    {{ 'courses.confirmEnrollment' | translate }}
                    <mat-icon>arrow_forward</mat-icon>
                  </button>
                  <a 
                    *ngIf="!isAuthenticated()" 
                    [routerLink]="['/auth/login']" 
                    [queryParams]="{ returnUrl: router.url }"
                    mat-raised-button 
                    color="primary" 
                    class="btn-checkout btn--full"
                    [class.disabled-link]="!isAvailable()"
                    [attr.aria-disabled]="!isAvailable()"
                    (click)="!isAvailable() && $event.preventDefault()"
                  >
                    {{ 'courses.enrollNow' | translate }}
                    <mat-icon>arrow_forward</mat-icon>
                  </a>
                </ng-template>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </section>
    </div>
    <div class="confirm-backdrop" *ngIf="confirmVisible()" (click)="cancelEnrollment()">
      <div class="confirm-dialog" role="dialog" aria-modal="true" (click)="$event.stopPropagation()">
        <div class="confirm-icon"><mat-icon>school</mat-icon></div>
        <h2>{{ 'courses.confirmTitle' | translate }}</h2>
        <p>{{ 'courses.confirmMessage' | translate:{ title: getTitle() } }}</p>
        <div class="confirm-total"><span>{{ 'courses.total' | translate }}</span><strong>{{ finalPrice() | number:'1.2-2' }} EGP</strong></div>
        <div class="confirm-actions">
          <button mat-stroked-button type="button" (click)="cancelEnrollment()">{{ 'courses.cancelEnrollment' | translate }}</button>
          <button mat-raised-button color="primary" type="button" (click)="confirmEnrollment()" [disabled]="submitting()">{{ submitting() ? ('courses.processing' | translate) : ('courses.confirmEnrollment' | translate) }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-hero {
      background: linear-gradient(135deg, var(--color-dark) 0%, var(--color-dark-2) 100%);
      color: var(--color-white);
      padding: var(--space-3xl) 0;
      &__container {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }
      &__category {
        align-self: flex-start;
      }
      &__title {
        font-size: clamp(var(--font-size-2xl), 4vw, var(--font-size-4xl));
        font-weight: 800;
        color: var(--color-white);
      }
      &__meta {
        display: flex;
        align-items: center;
        gap: var(--space-xl);
        font-size: var(--font-size-sm);
        color: var(--color-text-3);
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
            color: var(--color-primary-light);
          }
        }
      }
    }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-2xl);
      @media (min-width: 1024px) {
        grid-template-columns: 2fr 1fr;
      }
    }
    .detail-card {
      border: none !important;
      background: var(--color-white) !important;
      &__image-wrapper {
        height: 380px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      &__body {
        padding: var(--space-2xl);
        h2 {
          font-size: var(--font-size-xl);
          margin-bottom: var(--space-md);
        }
        .desc-content {
          color: var(--color-text-2);
          font-size: var(--font-size-md);
          line-height: 1.8;
          white-space: pre-line;
        }
      }
    }
    .checkout-card {
      border: none !important;
      background: var(--color-white) !important;
      position: sticky;
      top: calc(var(--navbar-height) + var(--space-lg));
      border-radius: var(--radius-xl) !important;
    }
    .checkout-content {
      padding: var(--space-xl) !important;
      display: flex;
      flex-direction: column;
      gap: var(--space-lg);
    }
    .price-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      padding-bottom: var(--space-md);
      border-bottom: 1px solid var(--color-border);
      .price-label {
        font-size: var(--font-size-sm);
        color: var(--color-muted);
        font-weight: 600;
      }
      .price-row {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        flex-wrap: wrap;
      }
      .price-original {
        font-size: var(--font-size-2xl);
        font-weight: 800;
        color: var(--color-primary-dark);
        &--slashed {
          font-size: var(--font-size-md);
          color: var(--color-text-3);
          text-decoration: line-through;
          font-weight: 600;
        }
      }
      .price-final {
        font-size: var(--font-size-3xl);
        font-weight: 900;
        color: var(--color-success);
      }
    }
    .btn-wishlist {
      height: 50px;
      border-radius: var(--radius-full) !important;
      font-weight: 700;
      color: var(--color-text-2) !important;
      border-color: var(--color-border-dark) !important;
      &--active {
        color: var(--color-error) !important;
        border-color: var(--color-error) !important;
        background: var(--color-error-light) !important;
      }
    }
    .btn-checkout {
      height: 52px;
      font-size: var(--font-size-md) !important;
      border-radius: var(--radius-full) !important;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      font-weight: 800;
      box-shadow: 0 8px 18px rgba(77, 90, 42, 0.24);
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);
      &:hover { transform: translateY(-2px); box-shadow: 0 12px 22px rgba(77, 90, 42, 0.3); }
    }
    .coupon-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      .coupon-field {
        width: 100%;
        min-height: 56px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding-inline: 8px 6px;
        border: 1px solid var(--color-border-dark);
        border-radius: var(--radius-md);
        background: var(--color-white);
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

        &:focus-within {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(77, 90, 42, 0.12);
        }

        input {
          flex: 1 1 0;
          min-width: 0;
          height: 40px;
          padding: 0 8px;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--color-dark);
          font: inherit;
        }
      }
      .coupon-apply-suffix {
        min-width: max-content;
        height: 38px;
        padding-inline: 8px;
        border: 0;
        border-radius: calc(var(--radius-md) - 2px);
        background: var(--color-primary-xlight);
        color: var(--color-primary-dark);
        white-space: nowrap;
        font-size: var(--font-size-xs);
        font-weight: 700;
        cursor: pointer;
        &:disabled { opacity: .55; cursor: not-allowed; }
      }
      .coupon-remove-button {
        width: 38px;
        height: 38px;
        display: grid;
        place-items: center;
        flex: 0 0 38px;
        border: 0;
        border-radius: 50%;
        color: var(--color-error);
        background: var(--color-error-light);
        cursor: pointer;
        mat-icon { width: 20px; height: 20px; font-size: 20px; }
      }
    .coupon-message {
        font-size: var(--font-size-xs);
        font-weight: 600;
        &.success { color: var(--color-success); }
        &.error { color: var(--color-error); }
      }
    }
    .enrolled-success-alert {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-sm);
      height: 48px;
      width: 100%;
      border-radius: var(--radius-md);
      mat-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
      span {
        font-weight: 700;
      }
    }
    .availability-message { text-align: center; color: var(--color-error); font-weight: 700; background: var(--color-error-light); padding: 10px; border-radius: var(--radius-md); }
    .price-summary { background: var(--color-primary-xlight); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; font-size: var(--font-size-sm); }
    .price-summary > div { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .price-summary strong { white-space: nowrap; }
    .price-summary .discount-value { color: var(--color-success); }
    .price-summary .summary-total { padding-top: 8px; margin-top: 4px; border-top: 1px dashed var(--color-border-dark); font-size: var(--font-size-md); color: var(--color-primary-dark); }
    .disabled-link { opacity: .55; pointer-events: none; }
    .confirm-backdrop { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 20px; background: rgba(25, 31, 20, .52); backdrop-filter: blur(3px); }
    .confirm-dialog { width: min(440px, 100%); padding: 28px; border-radius: var(--radius-xl); background: var(--color-white); box-shadow: var(--shadow-xl); text-align: center; }
    .confirm-icon { width: 52px; height: 52px; margin: 0 auto 12px; display: grid; place-items: center; border-radius: 50%; color: var(--color-primary); background: var(--color-primary-xlight); }
    .confirm-dialog h2 { margin-bottom: 8px; font-size: var(--font-size-xl); }
    .confirm-dialog p { color: var(--color-muted); margin-bottom: 18px; }
    .confirm-total { display: flex; justify-content: space-between; padding: 13px 15px; border-radius: var(--radius-md); background: var(--color-primary-xlight); font-weight: 700; margin-bottom: 20px; }
    .confirm-total strong { color: var(--color-primary-dark); }
    .confirm-actions { display: flex; justify-content: center; gap: 10px; }
    .confirm-actions button { border-radius: var(--radius-full) !important; min-width: 130px; }
    @media (max-width: 767px) {
      .detail-main { padding-top: var(--space-xl); }
      .detail-card__image-wrapper { height: 240px; }
      .detail-card__body { padding: var(--space-lg); }
      .detail-sidebar { width: 100%; }
      .checkout-card { position: static; border-radius: var(--radius-lg) !important; }
      .checkout-content { padding: var(--space-lg) !important; gap: var(--space-md); }
      .coupon-apply-suffix { padding-inline: 4px; font-size: 11px; }
    }
    [dir="rtl"] .course-detail {
      .detail-hero__title, .detail-hero__meta, .detail-card__body, .checkout-content {
        font-family: var(--font-arabic);
      }
      .btn-checkout mat-icon { transform: rotate(180deg); }
    }
  `],
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private wishlistService = inject(WishlistService);
  private enrollmentService = inject(EnrollmentService);
  private couponService = inject(CouponService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private languageService = inject(LanguageService);
  router = inject(Router);
  course = signal<Course | null>(null);
  isWishlisted = signal(false);
  isEnrolled = signal(false);
  
  couponCode = '';
  couponError = signal('');
  couponApplied = signal(false);
  discountAmount = signal(0);
  finalPrice = signal(0);
  
  submitting = signal(false);
  confirmVisible = signal(false);
  currentLang = this.languageService.currentLang;
  getImageUrl(): string {
    const image = this.course()?.image;
    if (!image) return 'assets/images/placeholder.jpg';
    const driveFile = image.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    return driveFile ? `https://drive.google.com/uc?export=view&id=${driveFile[1]}` : image;
  }
  ngOnInit(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.loadCourseDetails(courseId);
    }
  }
  loadCourseDetails(id: string): void {
    this.courseService.getCourse(id).subscribe({
      next: (res) => {
        this.couponError.set('');
        const courseData = res.data;
        this.course.set(courseData);
        this.finalPrice.set(Number(courseData.price));
        this.checkUserRelations(courseData.id);
      },
      error: () => {
        this.toastService.error('Course details not found');
        this.router.navigate(['/courses']);
      },
    });
  }
  checkUserRelations(courseId: string): void {
    if (this.authService.isAuthenticated()) {
      // Wishlist check
      this.wishlistService.getWishlist().subscribe({
        next: (res) => {
          const isSaved = res.data.some((item: any) => item.courseId === courseId);
          this.isWishlisted.set(isSaved);
        },
      });
      // Enrollment check
      this.enrollmentService.getMyEnrollments().subscribe({
        next: (res) => {
          const isEnrolled = res.data.some((item: any) => item.courseId === courseId);
          this.isEnrolled.set(isEnrolled);
        },
      });
    }
  }
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
  getTitle(): string {
    const course = this.course();
    if (!course) return '';
    return this.currentLang() === 'ar' ? course.title_ar : course.title_en;
  }
  getDesc(): string {
    const course = this.course();
    if (!course) return '';
    return this.currentLang() === 'ar' ? course.description_ar : course.description_en;
  }
  isFull(): boolean { const course = this.course(); return !!course?.maxStudents && (course._count?.enrollments ?? 0) >= course.maxStudents; }
  isEnded(): boolean { const endDate = this.course()?.endDate; return !!endDate && new Date(endDate).getTime() < Date.now(); }
  isAvailable(): boolean { return !this.isFull() && !this.isEnded(); }
  availabilityLabel(): string { return this.isFull() ? 'courses.full' : this.isEnded() ? 'courses.ended' : 'courses.enrollNow'; }
  courseDateRange(): string { const course = this.course(); if (!course) return ''; const locale = this.currentLang() === 'ar' ? 'ar-EG' : 'en-GB'; const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }; return [course.startDate, course.endDate].filter(Boolean).map(value => new Intl.DateTimeFormat(locale, options).format(new Date(value!))).join(' – '); }
  onWishlistToggle(): void {
    const course = this.course();
    if (!course) return;
    if (!this.isAuthenticated()) {
      this.toastService.warning('Please login to manage your wishlist');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    if (this.isWishlisted()) {
      this.wishlistService.removeFromWishlist(course.id).subscribe({
        next: () => {
          this.isWishlisted.set(false);
          this.toastService.success('Removed from wishlist');
        },
      });
    } else {
      this.wishlistService.addToWishlist(course.id).subscribe({
        next: () => {
          this.isWishlisted.set(true);
          this.toastService.success('Added to wishlist');
        },
      });
    }
  }
  applyCoupon(): void {
    if (!this.couponCode) return;
    const courseId = this.course()?.id;
    this.couponService.validateCoupon(this.couponCode, courseId).subscribe({
      next: (res) => {
        this.couponError.set('');
        const validation: CouponValidation = res.data;
        const originalPrice = Number(this.course()?.price || 0);
        let discount = 0;
        if (validation.type === 'PERCENTAGE') {
          discount = (originalPrice * Number(validation.discount)) / 100;
        } else {
          discount = Number(validation.discount);
        }
        this.discountAmount.set(discount);
        this.finalPrice.set(Math.max(0, originalPrice - discount));
        this.couponApplied.set(true);
        this.toastService.success('Coupon applied successfully');
      },
      error: (err) => {
        this.couponError.set(err.error?.message || (this.currentLang() === 'ar' ? 'كود الخصم غير صالح أو منتهي.' : 'This coupon code is invalid or expired.'));
        this.toastService.error(this.couponError());
        this.couponCode = '';
      },
    });
  }
  removeCoupon(): void {
    this.couponCode = '';
    this.couponError.set('');
    this.couponApplied.set(false);
    this.discountAmount.set(0);
    this.finalPrice.set(Number(this.course()?.price || 0));
  }
  enrollInCourse(): void {
    const course = this.course();
    if (!course) return;
    this.confirmVisible.set(true);
  }
  cancelEnrollment(): void {
    if (!this.submitting()) this.confirmVisible.set(false);
  }
  confirmEnrollment(): void {
    const course = this.course();
    if (!course) return;
    this.submitting.set(true);
    const payload = {
      courseId: course.id,
      couponCode: this.couponApplied() ? this.couponCode : undefined,
    };
    this.enrollmentService.enroll(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.confirmVisible.set(false);
        this.isEnrolled.set(true);
        this.toastService.success('Enrollment successful!');
      },
      error: (err) => {
        this.submitting.set(false);
        this.toastService.error(err.error?.message || 'Enrollment failed');
      },
    });
  }
}
