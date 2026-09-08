import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgClass, DecimalPipe } from '@angular/common';
import { Course } from '../../core/models/course.model';
import { LanguageService } from '../../core/services/language.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [RouterLink, TranslateModule, NgIf, NgClass, DecimalPipe, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="course-card card">
      <div class="course-card__image-wrapper">
        <img mat-card-image [src]="getImageUrl()" [alt]="getTitle()" />
        <span class="course-card__category badge badge--primary">{{ course.category }}</span>
        
        <!-- Wishlist Button -->
        <button 
          mat-icon-button 
          class="course-card__wishlist-btn" 
          [ngClass]="{ 'course-card__wishlist-btn--active': isWishlisted }" 
          (click)="toggleWishlist($event)"
          [title]="(isWishlisted ? 'courses.removeFromWishlist' : 'courses.addToWishlist') | translate"
        >
          <mat-icon>{{ isWishlisted ? 'favorite' : 'favorite_border' }}</mat-icon>
        </button>
      </div>
      <mat-card-content class="course-card__content">
        <h3 class="course-card__title">{{ getTitle() }}</h3>
        <p class="course-card__desc">{{ getDesc() }}</p>
        <div class="course-card__meta">
          <div class="meta-item">
            <mat-icon>schedule</mat-icon>
            <span>{{ course.duration }}</span>
          </div>
          <div class="meta-item" *ngIf="course.maxStudents">
            <mat-icon>people</mat-icon>
            <span>{{ course.maxStudents }} {{ 'courses.students' | translate }}</span>
          </div>
          <div class="meta-item" *ngIf="course.startDate || course.endDate">
            <mat-icon>event</mat-icon>
            <span>{{ dateRange() }}</span>
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions class="course-card__actions">
        <div class="course-card__price">
          <span class="price-value">{{ course.price | number:'1.2-2' }}</span>
          <span class="price-currency"> EGP</span>
        </div>
        <div class="course-card__btns">
          <a [routerLink]="['/courses', course.id]" mat-stroked-button color="primary" class="btn-detail">
            <mat-icon>visibility</mat-icon>
            {{ 'courses.viewDetails' | translate }}
          </a>
          <button *ngIf="!isEnrolled" (click)="onEnrollClick($event)" mat-raised-button color="primary" class="btn-enroll" [disabled]="!isAvailable()">
            <mat-icon>school</mat-icon>
            {{ availabilityLabel() | translate }}
          </button>
          <span *ngIf="isEnrolled" class="badge badge--success enrolled-badge">
            <mat-icon>check_circle</mat-icon>
            {{ 'courses.enrolled' | translate }}
          </span>
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .course-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      border: none !important;
      background: var(--color-white) !important;
      &__image-wrapper {
        position: relative;
        height: 200px;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }
      }
      &:hover &__image-wrapper img {
        transform: scale(1.05);
      }
      &__category {
        position: absolute;
        top: var(--space-md);
        left: var(--space-md);
        z-index: 1;
        [dir="rtl"] & {
          left: auto;
          right: var(--space-md);
        }
      }
      &__wishlist-btn {
        position: absolute;
        top: var(--space-sm);
        right: var(--space-sm);
        z-index: 1;
        background: rgba(255, 255, 255, 0.9) !important;
        color: var(--color-text-3) !important;
        transition: all var(--transition-fast) !important;
        &:hover {
          background: var(--color-white) !important;
          color: var(--color-error) !important;
          transform: scale(1.1);
        }
        &--active {
          color: var(--color-error) !important;
        }
        [dir="rtl"] & {
          right: auto;
          left: var(--space-sm);
        }
      }
      &__content {
        padding: var(--space-lg) !important;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
      }
      &__title {
        font-size: var(--font-size-md);
        font-weight: 700;
        color: var(--color-dark);
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        height: 2.8em;
      }
      &__desc {
        font-size: var(--font-size-sm);
        color: var(--color-muted);
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        height: 4.5em;
      }
      &__meta {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin-top: auto;
        padding-top: var(--space-sm);
        border-top: 1px solid var(--color-bg);
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--color-text-2);
          font-size: var(--font-size-xs);
          font-weight: 500;
          mat-icon {
            font-size: 16px;
            width: 16px;
            height: 16px;
            color: var(--color-primary);
          }
        }
      }
      &__actions {
        padding: var(--space-md) var(--space-lg) var(--space-lg) !important;
        border-top: 1px solid var(--color-border);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-md);
        background: var(--color-white);
      }
      &__price {
        display: flex;
        align-items: baseline;
        .price-value {
          font-size: var(--font-size-lg);
          font-weight: 800;
          color: var(--color-primary-dark);
        }
        .price-currency {
          font-size: var(--font-size-xs);
          font-weight: 700;
          color: var(--color-muted);
        }
      }
      &__btns {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-items: center;
        gap: var(--space-sm);
        .btn-detail {
          min-width: 0 !important;
          height: 42px;
          padding: 0 14px !important;
          border-radius: var(--radius-full) !important;
          font-weight: 700;
          font-size: clamp(11px, 1.15vw, 13px) !important;
          letter-spacing: 0;
          mat-icon { margin-right: 4px; font-size: 18px; width: 18px; height: 18px; }
        }
        .btn-enroll {
          min-width: 0;
          height: 42px;
          padding: 0 16px !important;
          border-radius: var(--radius-full) !important;
          font-weight: 700;
          font-size: clamp(11px, 1.15vw, 13px) !important;
          box-shadow: 0 5px 12px rgba(77, 90, 42, 0.22);
          mat-icon { margin-right: 4px; font-size: 18px; width: 18px; height: 18px; }
          &:hover { transform: translateY(-1px); box-shadow: 0 8px 16px rgba(77, 90, 42, 0.3); }
        }
        .enrolled-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          height: 36px;
          padding: 0 var(--space-md);
          border-radius: var(--radius-md);
          mat-icon {
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
      @media (max-width: 600px) {
        &__actions { align-items: stretch; flex-direction: column; gap: var(--space-md); }
        &__price { justify-content: center; }
        &__btns { width: 100%; }
      }
      @media (max-width: 390px) {
        &__btns { grid-template-columns: 1fr; }
      }
    }
    [dir="rtl"] .course-card {
      &__title, &__desc, &__meta, &__actions {
        font-family: var(--font-arabic);
      }
      .btn-detail mat-icon, .btn-enroll mat-icon { margin-right: 0; margin-left: 4px; }
    }
  `],
})
export class CourseCardComponent {
  private languageService = inject(LanguageService);
  @Input() course!: Course;
  @Input() isWishlisted = false;
  @Input() isEnrolled = false;
  @Output() wishlistToggle = new EventEmitter<string>();
  @Output() enrollTrigger = new EventEmitter<Course>();
  currentLang = this.languageService.currentLang;
  getTitle(): string {
    return this.currentLang() === 'ar' ? this.course.title_ar : this.course.title_en;
  }
  getDesc(): string {
    return this.currentLang() === 'ar' ? this.course.description_ar : this.course.description_en;
  }
  getImageUrl(): string {
    const image = this.course.image;
    if (!image) return 'assets/images/placeholder.jpg';
    const driveFile = image.match(/drive\.google\.com\/file\/d\/([^/]+)/);
    return driveFile ? `https://drive.google.com/uc?export=view&id=${driveFile[1]}` : image;
  }
  toggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistToggle.emit(this.course.id);
  }
  onEnrollClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.enrollTrigger.emit(this.course);
  }
  isFull(): boolean { return !!this.course.maxStudents && (this.course._count?.enrollments ?? 0) >= this.course.maxStudents; }
  isEnded(): boolean { return !!this.course.endDate && new Date(this.course.endDate).getTime() < Date.now(); }
  isAvailable(): boolean { return !this.isFull() && !this.isEnded(); }
  availabilityLabel(): string { return this.isFull() ? 'courses.full' : this.isEnded() ? 'courses.ended' : 'courses.enrollNow'; }
  dateRange(): string { const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }; const locale = this.currentLang() === 'ar' ? 'ar-EG' : 'en-GB'; const start = this.course.startDate ? new Intl.DateTimeFormat(locale, options).format(new Date(this.course.startDate)) : ''; const end = this.course.endDate ? new Intl.DateTimeFormat(locale, options).format(new Date(this.course.endDate)) : ''; return [start, end].filter(Boolean).join(' – '); }
}
