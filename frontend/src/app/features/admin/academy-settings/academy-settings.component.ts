import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AcademyService } from '../../../core/services/academy.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-academy-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MatButtonModule, MatIconModule],
  template: `
    <section class="settings-page animate-fade-in">
      <div class="page-heading"><div><span class="eyebrow">Public website</span><h1>Academy information</h1><p>Changes are saved to the database and appear on the public site immediately.</p></div></div>
      <form [formGroup]="form" (ngSubmit)="save()" class="settings-card card">
        <h2><mat-icon>business</mat-icon> Academy identity</h2>
        <label>Academy name<input formControlName="name" placeholder="Med Bridge Academy" /></label>
        <label>اسم الأكاديمية بالعربية<input formControlName="nameAr" /></label>
        <label>Short introduction<textarea formControlName="tagline" rows="2"></textarea></label>
        <label>نبذة مختصرة بالعربية<textarea formControlName="taglineAr" rows="2"></textarea></label>
        <label>Full description<textarea formControlName="description" rows="4"></textarea></label>
        <label>الوصف بالعربية<textarea formControlName="descriptionAr" rows="4"></textarea></label>
        <h2><mat-icon>link</mat-icon> Official links and contact details</h2>
        <div class="form-grid">
          <label>WhatsApp link<input formControlName="whatsappUrl" type="url" /></label>
          <label>WhatsApp channel<input formControlName="whatsappChannel" type="url" /></label>
          <label>Facebook link<input formControlName="facebookUrl" type="url" /></label>
          <label>Instagram link<input formControlName="instagramUrl" type="url" /></label>
          <label>TikTok link<input formControlName="tiktokUrl" type="url" /></label>
          <label>Suturing videos link<input formControlName="suturingVideosUrl" type="url" /></label>
          <label>Email<input formControlName="email" type="email" /></label>
          <label>Phone<input formControlName="phone" type="tel" /></label>
          <label>Location<input formControlName="location" placeholder="Mansoura, Egypt" /></label>
        </div>
        <button mat-raised-button color="primary" type="submit" [disabled]="saving"><mat-icon>save</mat-icon>{{ saving ? 'Saving…' : 'Save changes' }}</button>
      </form>
    </section>
  `,
  styles: [`
    .page-heading{display:flex;justify-content:space-between;margin-bottom:var(--space-xl)} h1{margin:4px 0;font-weight:800}.eyebrow{color:var(--color-primary);font-weight:700;text-transform:uppercase;font-size:12px}.settings-card{max-width:900px;padding:var(--space-2xl);display:flex;flex-direction:column;gap:var(--space-lg)}h2{display:flex;align-items:center;gap:8px;font-size:18px;margin:8px 0 0}label{display:flex;flex-direction:column;gap:7px;font-weight:700;color:var(--color-dark)}input,textarea{border:1px solid #d7dee8;border-radius:8px;padding:11px;font:inherit;font-weight:400}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-md)}button{align-self:flex-start}@media(max-width:650px){.form-grid{grid-template-columns:1fr}.settings-card{padding:var(--space-lg)}}
  `],
})
export class AcademySettingsComponent implements OnInit {
  private fb = inject(FormBuilder); private academy = inject(AcademyService); private toast = inject(ToastService);
  saving = false;
  form = this.fb.nonNullable.group({ name: '', nameAr: '', tagline: '', taglineAr: '', description: '', descriptionAr: '', whatsappUrl: '', whatsappChannel: '', facebookUrl: '', instagramUrl: '', tiktokUrl: '', suturingVideosUrl: '', email: '', phone: '', location: '' });
  ngOnInit(): void { this.academy.getProfile().subscribe({ next: r => {
    const profile = r.data.profile;
    this.form.patchValue({
      name: profile.name, nameAr: profile.nameAr ?? '', tagline: profile.tagline, taglineAr: profile.taglineAr ?? '', description: profile.description, descriptionAr: profile.descriptionAr ?? '',
      whatsappUrl: profile.whatsappUrl ?? '', whatsappChannel: profile.whatsappChannel ?? '', facebookUrl: profile.facebookUrl ?? '',
      instagramUrl: profile.instagramUrl ?? '', tiktokUrl: profile.tiktokUrl ?? '', suturingVideosUrl: profile.suturingVideosUrl ?? '',
      email: profile.email ?? '', phone: profile.phone ?? '', location: profile.location ?? '',
    });
  }, error: () => this.toast.error('Could not load academy information.') }); }
  save(): void { this.saving = true; this.academy.updateProfile(this.form.getRawValue()).subscribe({ next: () => { this.saving = false; this.toast.success('Academy information saved.'); }, error: () => { this.saving = false; this.toast.error('Could not save academy information.'); } }); }
}
