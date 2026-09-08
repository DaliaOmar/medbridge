import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
export type Language = 'en' | 'ar';
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private translate = inject(TranslateService);
  private document = inject(DOCUMENT);
  private readonly LANG_KEY = 'mb_language';
  private _currentLang = signal<Language>('en');
  readonly currentLang = this._currentLang.asReadonly();
  readonly isRtl = () => this._currentLang() === 'ar';
  initLanguage(): void {
    this.translate.addLangs(['en', 'ar']);
    this.translate.setDefaultLang('en');
    const stored = localStorage.getItem(this.LANG_KEY) as Language | null;
    const browserLang = this.translate.getBrowserLang();
    const lang: Language = stored || (browserLang === 'ar' ? 'ar' : 'en');
    this.setLanguage(lang);
  }
  setLanguage(lang: Language): void {
    this._currentLang.set(lang);
    this.translate.use(lang);
    localStorage.setItem(this.LANG_KEY, lang);
    this.updateDocumentDirection(lang);
  }
  changeLanguage(lang: Language): void {
    this.setLanguage(lang);
  }
  toggleLanguage(): void {
    this.setLanguage(this._currentLang() === 'en' ? 'ar' : 'en');
  }
  private updateDocumentDirection(lang: Language): void {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.document.documentElement.setAttribute('dir', dir);
    this.document.documentElement.setAttribute('lang', lang);
  }
}
