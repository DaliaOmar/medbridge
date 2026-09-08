import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { CourseService } from '../../core/services/course.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { AuthService } from '../../core/services/auth.service';
import { Course } from '../../core/models/course.model';
import { CourseCardComponent } from '../../shared/course-card/course-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { AcademyService } from '../../core/services/academy.service';
import { AcademyProfile } from '../../core/models/academy-profile.model';
import { LanguageService } from '../../core/services/language.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TranslateModule, NgIf, NgFor, CourseCardComponent, MatIconModule, MatButtonModule],
  template: `
    <div class="home-page animate-fade-in">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero__container container">
          <div class="hero__content">
            <span class="hero__badge">{{ 'home.hero.badge' | translate }}</span>
            <h1 class="hero__title">{{ academyName() }}</h1>
            <p class="hero__subtitle">{{ academyTagline() }}</p>
            <p class="hero__desc">{{ academyDescription() }}</p>
            <div class="hero__actions">
              <a routerLink="/courses" mat-raised-button color="accent" class="btn-hero-primary">
                {{ 'home.hero.cta' | translate }}
                <mat-icon>arrow_forward</mat-icon>
              </a>
              <a href="#why-choose-us" mat-stroked-button class="btn-hero-secondary" (click)="scrollToWhyChooseUs($event)">
                {{ 'home.hero.ctaSecondary' | translate }}
              </a>
            </div>
          </div>
          <div class="hero__image hide-mobile">
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800" alt="Medical Training" />
          </div>
        </div>
      </section>
      <!-- Stats Section -->
      <section class="stats">
        <div class="stats__container container grid grid-4">
          <div class="stat-item card">
            <mat-icon class="stat-item__icon">school</mat-icon>
            <span class="stat-item__value">15+</span>
            <span class="stat-item__label">{{ 'home.stats.courses' | translate }}</span>
          </div>
          <div class="stat-item card">
            <mat-icon class="stat-item__icon">people</mat-icon>
            <span class="stat-item__value">2,500+</span>
            <span class="stat-item__label">{{ 'home.stats.students' | translate }}</span>
          </div>
          <div class="stat-item card">
            <mat-icon class="stat-item__icon">workspace_premium</mat-icon>
            <span class="stat-item__value">50+</span>
            <span class="stat-item__label">{{ 'home.stats.instructors' | translate }}</span>
          </div>
          <div class="stat-item card">
            <mat-icon class="stat-item__icon">mood</mat-icon>
            <span class="stat-item__value">99%</span>
            <span class="stat-item__label">{{ 'home.stats.satisfaction' | translate }}</span>
          </div>
        </div>
      </section>
      <!-- Featured Courses Section -->
      <section id="featured-courses" class="featured-courses section">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">{{ 'home.courses.tag' | translate }}</span>
            <h2>{{ 'home.courses.title' | translate }}</h2>
            <p>{{ 'home.courses.subtitle' | translate }}</p>
          </div>
          <div *ngIf="loading()" class="grid grid-3">
            <div class="skeleton-card skeleton" style="height: 400px; border-radius: var(--radius-lg);" *ngFor="let i of [1,2,3]"></div>
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
          <div class="featured-courses__cta text-center" style="margin-top: var(--space-2xl);">
            <a routerLink="/courses" mat-stroked-button color="primary" class="btn--lg btn-view-all-courses">
              {{ 'home.courses.viewAll' | translate }}
            </a>
          </div>
        </div>
      </section>
      <!-- Why Choose Us Section -->
      <section id="why-choose-us" class="why-choose-us section" style="background: var(--color-white);">
        <div class="container">
          <div class="section-header">
            <span class="section-tag">{{ 'home.why.tag' | translate }}</span>
            <h2>{{ 'home.why.title' | translate }}</h2>
            <p>{{ 'home.why.subtitle' | translate }}</p>
          </div>
          <div class="grid grid-3">
            <div class="why-item card">
              <div class="why-item__icon-wrapper">
                <mat-icon>touch_app</mat-icon>
              </div>
              <h3>{{ 'home.why.item1Title' | translate }}</h3>
              <p>{{ 'home.why.item1Desc' | translate }}</p>
            </div>
            <div class="why-item card">
              <div class="why-item__icon-wrapper">
                <mat-icon>verified_user</mat-icon>
              </div>
              <h3>{{ 'home.why.item2Title' | translate }}</h3>
              <p>{{ 'home.why.item2Desc' | translate }}</p>
            </div>
            <div class="why-item card">
              <div class="why-item__icon-wrapper">
                <mat-icon>event</mat-icon>
              </div>
              <h3>{{ 'home.why.item3Title' | translate }}</h3>
              <p>{{ 'home.why.item3Desc' | translate }}</p>
            </div>
            <div class="why-item card">
              <div class="why-item__icon-wrapper">
                <mat-icon>military_tech</mat-icon>
              </div>
              <h3>{{ 'home.why.item4Title' | translate }}</h3>
              <p>{{ 'home.why.item4Desc' | translate }}</p>
            </div>
            <div class="why-item card">
              <div class="why-item__icon-wrapper">
                <mat-icon>groups</mat-icon>
              </div>
              <h3>{{ 'home.why.item5Title' | translate }}</h3>
              <p>{{ 'home.why.item5Desc' | translate }}</p>
            </div>
            <div class="why-item card">
              <div class="why-item__icon-wrapper">
                <mat-icon>domain</mat-icon>
              </div>
              <h3>{{ 'home.why.item6Title' | translate }}</h3>
              <p>{{ 'home.why.item6Desc' | translate }}</p>
            </div>
          </div>
        </div>
      </section>
      <!-- CTA Banner Section -->
      <section class="cta-banner">
        <div class="cta-banner__container container card">
          <div class="cta-banner__content">
            <h2>{{ 'home.cta.title' | translate }}</h2>
            <p>{{ 'home.cta.subtitle' | translate }}</p>
            <div class="cta-banner__actions">
              <a href="#featured-courses" mat-raised-button color="accent" class="btn-cta-primary" (click)="onEnrollNow($event)">
                {{ 'home.cta.btn' | translate }}
              </a>
              <a href="#contact" mat-stroked-button class="btn-cta-secondary" (click)="scrollToContact($event)">
                {{ 'home.cta.btnSecondary' | translate }}
              </a>
            </div>
          </div>
        </div>
      </section>
      <section id="contact" class="section contact-section">
        <div class="container">
          <div class="section-header"><span class="section-tag">{{ 'home.contact.tag' | translate }}</span><h2>{{ 'home.contact.title' | translate }}</h2><p>{{ 'home.contact.subtitle' | translate }}</p></div>
          <div class="contact-links">
            <a *ngIf="academy().suturingVideosUrl" [href]="academy().suturingVideosUrl" target="_blank" rel="noopener"><mat-icon>play_circle</mat-icon>{{ 'home.contact.videos' | translate }}</a>
            <a *ngIf="academy().whatsappUrl" [href]="academy().whatsappUrl" target="_blank" rel="noopener"><mat-icon>chat</mat-icon>WhatsApp</a>
            <a *ngIf="academy().whatsappChannel" [href]="academy().whatsappChannel" target="_blank" rel="noopener"><mat-icon>campaign</mat-icon>{{ 'home.contact.whatsappChannel' | translate }}</a>
            <a *ngIf="academy().instagramUrl" [href]="academy().instagramUrl" target="_blank" rel="noopener"><mat-icon>photo_camera</mat-icon>Instagram</a>
            <a *ngIf="academy().facebookUrl" [href]="academy().facebookUrl" target="_blank" rel="noopener"><mat-icon>thumb_up</mat-icon>Facebook</a>
            <a *ngIf="academy().tiktokUrl" [href]="academy().tiktokUrl" target="_blank" rel="noopener"><mat-icon>music_note</mat-icon>TikTok</a>
            <a *ngIf="academy().email" [href]="'mailto:' + academy().email"><mat-icon>email</mat-icon>{{ academy().email }}</a>
            <a *ngIf="academy().phone" [href]="'tel:' + academy().phone"><mat-icon>phone</mat-icon>{{ academy().phone }}</a>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .hero {
      background: linear-gradient(135deg, var(--color-primary-xlight) 0%, #ffffff 100%);
      padding: var(--space-4xl) 0 var(--space-3xl);
      overflow: hidden;
      &__container {
        display: flex;
        align-items: center;
        gap: var(--space-3xl);
      }
      &__content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }
      &__badge {
        align-self: flex-start;
        background: var(--color-primary);
        color: var(--color-white);
        padding: var(--space-xs) var(--space-md);
        border-radius: var(--radius-full);
        font-size: var(--font-size-xs);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      &__title {
        font-size: clamp(var(--font-size-3xl), 5vw, var(--font-size-5xl));
        line-height: 1.1;
        color: var(--color-dark);
        font-weight: 800;
      }
      &__subtitle {
        font-size: var(--font-size-xl);
        color: var(--color-primary-dark);
        font-weight: 600;
      }
      &__desc {
        font-size: var(--font-size-md);
        color: var(--color-muted);
        max-width: 600px;
        line-height: 1.7;
      }
      &__actions {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin-top: var(--space-lg);
      }
      .btn-hero-secondary {
        min-height: 46px;
        padding-inline: 28px !important;
        border-radius: var(--radius-full) !important;
        font-weight: 700;
      }
      &__image {
        flex: 1;
        max-width: 550px;
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--shadow-xl);
        img {
          width: 100%;
          height: auto;
          display: block;
        }
      }
    }
    .stats {
      margin-top: calc(var(--space-2xl) * -1);
      position: relative;
      z-index: 10;
      .stat-item {
        padding: var(--space-xl);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: var(--color-white);
        border: none !important;
        &__icon {
          font-size: 36px;
          width: 36px;
          height: 36px;
          color: var(--color-primary);
          margin-bottom: var(--space-sm);
        }
        &__value {
          font-size: var(--font-size-3xl);
          font-weight: 800;
          color: var(--color-dark);
        }
        &__label {
          font-size: var(--font-size-sm);
          color: var(--color-muted);
          font-weight: 600;
        }
      }
    }
    .why-item {
      padding: var(--space-2xl);
      text-align: center;
      background: var(--color-bg);
      border: none !important;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-sm);
      &__icon-wrapper {
        width: 64px;
        height: 64px;
        background: var(--color-primary-xlight);
        color: var(--color-primary);
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--space-sm);
        mat-icon {
          font-size: 32px;
          width: 32px;
          height: 32px;
        }
      }
      h3 {
        font-size: var(--font-size-lg);
        color: var(--color-dark);
      }
      p {
        font-size: var(--font-size-sm);
        color: var(--color-muted);
        line-height: 1.6;
      }
    }
    .cta-banner {
      padding: var(--space-4xl) 0;
      background: var(--color-bg-2);
      &__container {
        background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-dark) 100%);
        color: var(--color-white);
        padding: var(--space-3xl) var(--space-xl);
        text-align: center;
        border: none !important;
        @media (min-width: 768px) {
          padding: var(--space-4xl) var(--space-3xl);
        }
      }
      &__content {
        max-width: 700px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-md);
      }
      h2 {
        color: var(--color-white);
        font-size: clamp(var(--font-size-2xl), 4vw, var(--font-size-4xl));
        font-weight: 800;
      }
      p {
        color: var(--color-primary-xlight);
        font-size: var(--font-size-lg);
      }
      &__actions {
        display: flex;
        align-items: center;
        gap: var(--space-md);
        margin-top: var(--space-lg);
        .btn-cta-secondary {
          color: var(--color-white);
          border-color: rgba(255, 255, 255, 0.3);
          &:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: var(--color-white);
          }
        }
      }
    }
    .btn-view-all-courses,
    .btn-cta-primary,
    .btn-cta-secondary {
      min-height: 46px;
      padding-inline: 28px !important;
      border-radius: var(--radius-full) !important;
      font-weight: 700;
    }
    .contact-links { display:flex; flex-wrap:wrap; justify-content:center; gap:var(--space-md); }
    .contact-links a { display:flex; align-items:center; gap:8px; padding:12px 16px; border:1px solid var(--color-primary-xlight); border-radius:var(--radius-md); color:var(--color-primary-dark); text-decoration:none; font-weight:700; background:#fff; }
    [dir="rtl"] .home-page {
      .hero__title, .hero__subtitle, .hero__desc, .stat-item__label, .why-item h3, .why-item p, .cta-banner p, h2 {
        font-family: var(--font-arabic);
      }
    }
  `],
})
export class HomeComponent implements OnInit {
  private courseService = inject(CourseService);
  private wishlistService = inject(WishlistService);
  private enrollmentService = inject(EnrollmentService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private academyService = inject(AcademyService);
  private languageService = inject(LanguageService);
  academy = signal<AcademyProfile>({ id: 1, name: 'Med Bridge Academy', tagline: 'Practical medical training for students and healthcare professionals.', description: 'Learn. Practice. Grow.' });
  courses = signal<Course[]>([]);
  loading = signal(true);
  wishlistedIds = signal<string[]>([]);
  enrolledIds = signal<string[]>([]);
  ngOnInit(): void {
    this.loadFeaturedCourses();
    this.loadUserData();
    this.academyService.getProfile().subscribe({ next: res => this.academy.set(res.data.profile) });
    if (this.route.snapshot.queryParamMap.get('scrollTo') === 'featured-courses') {
      setTimeout(() => document.getElementById('featured-courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }
  academyName(): string { const profile = this.academy(); return this.languageService.currentLang() === 'ar' ? (profile.nameAr || 'أكاديمية ميد بريدج') : profile.name; }
  academyTagline(): string { const profile = this.academy(); return this.languageService.currentLang() === 'ar' ? (profile.taglineAr || 'تدريب طبي عملي لطلاب الطب والعاملين في المجال الصحي.') : profile.tagline; }
  academyDescription(): string { const profile = this.academy(); return this.languageService.currentLang() === 'ar' ? (profile.descriptionAr || 'تعلّم، وتدرّب، وتطوّر.') : profile.description; }
  loadFeaturedCourses(): void {
    this.loading.set(true);
    this.courseService.getCourses({ page: 1, limit: 3 }).subscribe({
      next: (res) => {
        this.courses.set(res.data.courses);
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
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/' } });
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

  scrollToContact(event: Event): void {
    event.preventDefault();
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToWhyChooseUs(event: Event): void {
    event.preventDefault();
    document.getElementById('why-choose-us')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  onEnrollNow(event: Event): void {
    event.preventDefault();
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/?scrollTo=featured-courses' } });
      return;
    }
    document.getElementById('featured-courses')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
