import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { AcademyService } from '../../core/services/academy.service';
import { AcademyProfile } from '../../core/models/academy-profile.model';
import { LanguageService } from '../../core/services/language.service';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule, MatIconModule, MatButtonModule, NgIf],
  template: `
    <footer class="footer">
      <div class="footer__container">
        <!-- Brand Info -->
        <div class="footer__brand">
          <div class="footer__logo">
            <img src="/assets/med-bridge-logo.png" alt="Med Bridge Academy" class="footer__logo-image" />
          </div>
          <p class="footer__desc">
            {{ footerDescription() }}
          </p>
          <p class="footer__desc footer__about">{{ footerAbout() }}</p>
        </div>
        <!-- Quick Links -->
        <div class="footer__links">
          <h4>{{ 'home.footer.quickLinks' | translate }}</h4>
          <ul>
            <li><a routerLink="/">{{ 'nav.home' | translate }}</a></li>
            <li><a routerLink="/courses">{{ 'nav.courses' | translate }}</a></li>
          </ul>
        </div>
        <!-- Contact Info -->
        <div class="footer__contact">
          <h4>{{ 'home.footer.contact' | translate }}</h4>
          <ul>
            <li *ngIf="academy().email">
              <mat-icon>email</mat-icon>
              <a *ngIf="academy().email" [href]="'mailto:' + academy().email">{{ academy().email }}</a>
            </li>
            <li *ngIf="academy().phone">
              <mat-icon>phone</mat-icon>
              <a *ngIf="academy().phone" [href]="'tel:' + academy().phone">{{ academy().phone }}</a>
            </li>
          
              <li>
              <mat-icon>place</mat-icon>
              <span>{{ footerLocation() }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="footer__bottom-container">
          <p>{{ copyrightText() }}</p>
          <div class="footer__socials">
            <a *ngIf="academy().facebookUrl" [href]="academy().facebookUrl" target="_blank" rel="noopener" mat-icon-button aria-label="Facebook"><mat-icon>facebook</mat-icon></a>
            <a *ngIf="academy().instagramUrl" [href]="academy().instagramUrl" target="_blank" rel="noopener" mat-icon-button aria-label="Instagram"><mat-icon>photo_camera</mat-icon></a>
            <a *ngIf="academy().whatsappUrl" [href]="academy().whatsappUrl" target="_blank" rel="noopener" mat-icon-button aria-label="WhatsApp"><mat-icon>chat</mat-icon></a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--color-dark);
      color: var(--color-white);
      padding: var(--space-3xl) 0 0;
      border-top: 1px solid var(--color-dark-2);
      &__container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 var(--space-md) var(--space-3xl);
        display: grid;
        grid-template-columns: 1fr;
        gap: var(--space-2xl);
        @media (min-width: 768px) {
          grid-template-columns: 2fr 1fr 1.5fr;
        }
      }
      &__brand {
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
      }
      &__logo {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        &-image {
          height: 54px;
          width: auto;
          display: block;
        }
      }
      &__desc {
        color: var(--color-text-3);
        font-size: var(--font-size-sm);
        max-width: 400px;
      }
      h4 {
        color: var(--color-white);
        font-size: var(--font-size-md);
        font-weight: 700;
        margin-bottom: var(--space-lg);
        position: relative;
        padding-bottom: var(--space-xs);
        &::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 32px;
          height: 2px;
          background: var(--color-primary-light);
        }
        [dir="rtl"] &::after {
          left: auto;
          right: 0;
        }
      }
      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-sm);
        a {
          color: var(--color-text-3);
          font-size: var(--font-size-sm);
          transition: all var(--transition-fast);
          &:hover {
            color: var(--color-white);
            padding-left: 6px;
          }
          [dir="rtl"] &:hover {
            padding-left: 0;
            padding-right: 6px;
          }
        }
      }
      &__contact {
        ul li {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          color: var(--color-text-3);
          font-size: var(--font-size-sm);
          mat-icon {
            color: var(--color-primary-light);
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }
      }
      &__bottom {
        border-top: 1px solid var(--color-dark-2);
        padding: var(--space-lg) 0;
        background: var(--color-dark);
        &-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 var(--space-md);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-md);
          @media (min-width: 768px) {
            flex-direction: row;
          }
          p {
            color: var(--color-text-3);
            font-size: var(--font-size-xs);
         
          }
        }
      }
      &__socials {
        display: flex;
        gap: var(--space-sm);
        a {
          color: var(--color-text-3);
          &:hover {
            color: var(--color-white);
            background: var(--color-dark-3);
          }
        }
      }
    }
    [dir="rtl"] .footer {
      h4, &__desc, ul, p {
        font-family: var(--font-arabic);
      }
    }
  `],
})
export class FooterComponent implements OnInit {
  private academyService = inject(AcademyService);
  private languageService = inject(LanguageService);
  academy = signal<AcademyProfile>({ id: 1, name: 'Med Bridge Academy', tagline: 'Practical medical training for students and healthcare professionals.', description: '', location: 'Mansoura, Egypt' });
  currentYear = new Date().getFullYear();
  currentLang = this.languageService.currentLang;
  footerDescription(): string {
    const profile = this.academy();
    return this.currentLang() === 'ar' ? (profile.taglineAr || profile.tagline) : profile.tagline;
  }
  footerAbout(): string {
    const profile = this.academy();
    return this.currentLang() === 'ar' ? (profile.descriptionAr || profile.description) : profile.description;
  }
  footerLocation(): string {
    return this.currentLang() === 'ar' ? 'المنصورة، مصر' : (this.academy().location || 'Mansoura, Egypt');
  }
  copyrightText(): string {
    return this.currentLang() === 'ar'
      ? `© ${this.currentYear} أكاديمية ميد بريدج. جميع الحقوق محفوظة.`
      : `© ${this.currentYear} Med Bridge Academy. All rights reserved.`;
  }
  ngOnInit(): void {
    this.academyService.getProfile().subscribe({ next: res => this.academy.set(res.data.profile) });
  }
}
