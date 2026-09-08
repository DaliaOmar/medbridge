import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor, NgClass, DatePipe, DecimalPipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { Coupon } from '../../../core/models/course.model';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, DecimalPipe, MatIconModule, MatButtonModule, FormsModule],
  template: `
    <div class="admin-coupons animate-fade-in">
      <div class="header-row">
        <h2>Coupons Management</h2>
        <button class="btn btn--primary btn--sm" (click)="toggleForm()">
          <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Cancel' : 'Create Coupon' }}
        </button>
      </div>
      <!-- Create Coupon Form -->
      <div class="form-wrapper card" *ngIf="showForm()" style="margin-bottom: var(--space-xl); padding: var(--space-xl);">
        <h3>Create New Coupon</h3>
        <form (ngSubmit)="onCreate()" class="coupon-form" #couponForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label>Coupon Code</label>
              <input type="text" [(ngModel)]="model.code" name="code" required placeholder="e.g. DISCOUNT30" class="form-input" />
            </div>
            <div class="form-group">
              <label>Discount Value</label>
              <input type="number" [(ngModel)]="model.discount" name="discount" required class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Discount Type</label>
              <select [(ngModel)]="model.type" name="type" required class="form-input select-input">
                <option value="PERCENTAGE">PERCENTAGE (%)</option>
                <option value="FIXED">FIXED AMOUNT (EGP)</option>
              </select>
            </div>
            <div class="form-group">
              <label>Max Uses</label>
              <input type="number" [(ngModel)]="model.maxUses" name="maxUses" class="form-input" />
            </div>
          </div>
          <button type="submit" class="btn btn--primary" [disabled]="couponForm.invalid || submitting()">
            Create Coupon
          </button>
        </form>
      </div>
      <!-- Coupons Table -->
      <div class="data-table-wrapper card">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Type</th>
              <th>Uses Count</th>
              <th>Max Uses</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let coupon of coupons()">
              <td>{{ coupon.code }}</td>
              <td>{{ coupon.discount | number:'1.2-2' }}</td>
              <td>{{ coupon.type }}</td>
              <td>{{ coupon.usedCount }}</td>
              <td>{{ coupon.maxUses || 'Unlimited' }}</td>
              <td>
                <span class="badge" [ngClass]="coupon.isActive ? 'badge--success' : 'badge--error'">
                  {{ coupon.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <button 
                  class="btn btn--sm" 
                  [ngClass]="coupon.isActive ? 'btn--danger' : 'btn--primary'"
                  (click)="toggleCouponStatus(coupon)"
                >
                  {{ coupon.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button mat-icon-button color="warn" (click)="deleteCoupon(coupon.id)" title="Delete coupon" aria-label="Delete coupon"><mat-icon>delete</mat-icon></button>
              </td>
            </tr>
            <tr *ngIf="coupons().length === 0">
              <td colspan="7" class="text-center text-muted">No coupons found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); }
    h2 { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-dark); }
    
    .coupon-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-xs); }
    .form-input {
      padding: 10px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      outline: none;
      &:focus { border-color: var(--color-primary); }
    }
    .select-input { background-color: var(--color-white); }
  `],
})
export class AdminCouponsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  coupons = signal<any[]>([]);
  showForm = signal(false);
  submitting = signal(false);
  model: { code: string; discount: number; type: Coupon['type']; maxUses: number | null } = this.emptyModel();
  ngOnInit(): void {
    this.loadCoupons();
  }
  loadCoupons(): void {
    this.adminService.getCoupons().subscribe({
      next: (res) => this.coupons.set(res.data),
    });
  }
  emptyModel(): { code: string; discount: number; type: Coupon['type']; maxUses: number | null } {
    return {
      code: '',
      discount: 0,
      type: 'PERCENTAGE',
      maxUses: null,
    };
  }
  toggleForm(): void {
    this.showForm.update(v => !v);
    this.model = this.emptyModel();
  }
  onCreate(): void {
    this.submitting.set(true);
    this.adminService.createCoupon({ ...this.model, maxUses: this.model.maxUses ?? undefined }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.toastService.success('Coupon created successfully');
        this.loadCoupons();
      },
      error: () => this.submitting.set(false),
    });
  }
  toggleCouponStatus(coupon: any): void {
    const nextStatus = !coupon.isActive;
    this.adminService.updateCouponStatus(coupon.id, nextStatus).subscribe({
      next: () => {
        this.toastService.success(`Coupon is now ${nextStatus ? 'active' : 'inactive'}`);
        this.loadCoupons();
      },
    });
  }
  deleteCoupon(id: string): void {
    if (!confirm('Delete this coupon permanently?')) return;
    this.adminService.deleteCoupon(id).subscribe({ next: () => { this.toastService.success('Coupon deleted successfully'); this.loadCoupons(); }, error: (err) => this.toastService.error(err.error?.message || 'Could not delete coupon') });
  }
}
