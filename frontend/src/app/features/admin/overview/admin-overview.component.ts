import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ToastService } from '../../../core/services/toast.service';
@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [TranslateModule, NgIf, NgFor, DecimalPipe, DatePipe, MatIconModule, MatCardModule],
  template: `
    <div class="admin-overview animate-fade-in">
      <div class="overview-header">
        <h2>Dashboard Overview</h2>
        <button class="btn btn--outline btn--sm" (click)="exportData()">
          <mat-icon>download</mat-icon>
          Export Data to Excel
        </button>
      </div>
      <!-- Stats Cards -->
      <div class="grid grid-4" style="margin-bottom: var(--space-xl);">
        <div class="stat-card card">
          <div class="stat-icon stat-icon--primary">
            <mat-icon>people</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ analytics()?.stats?.totalUsers || 0 }}</span>
            <span class="stat-label">Total Users</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon stat-icon--secondary">
            <mat-icon>school</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ analytics()?.stats?.totalCourses || 0 }}</span>
            <span class="stat-label">Total Courses</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon stat-icon--success">
            <mat-icon>receipt_long</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ analytics()?.stats?.totalEnrollments || 0 }}</span>
            <span class="stat-label">Total Enrollments</span>
          </div>
        </div>
        <div class="stat-card card">
          <div class="stat-icon stat-icon--warning">
            <mat-icon>payments</mat-icon>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ analytics()?.stats?.totalRevenue || 0 | number:'1.2-2' }}</span>
            <span class="stat-label">Total Revenue (EGP)</span>
          </div>
        </div>
      </div>
      <div class="grid grid-2" style="align-items: start;">
        <!-- Recent Enrollments -->
        <div class="data-table-wrapper card">
          <div class="table-header">
            <h3>Recent Enrollments</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Course (EN)</th>
                <th>Date</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of analytics()?.recentEnrollments || []">
                <td>{{ item.user.firstName }} {{ item.user.lastName }}</td>
                <td>{{ item.course.title_en }}</td>
                <td>{{ item.enrolledAt | date:'shortDate' }}</td>
                <td>{{ item.pricePaid | number:'1.2-2' }} EGP</td>
              </tr>
              <tr *ngIf="(analytics()?.recentEnrollments || []).length === 0">
                <td colspan="4" class="text-center text-muted">No enrollments yet</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Recent Users -->
        <div class="data-table-wrapper card">
          <div class="table-header">
            <h3>Recent Users</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of analytics()?.recentUsers || []">
                <td>{{ user.firstName }} {{ user.lastName }}</td>
                <td>{{ user.email }}</td>
                <td><span class="badge badge--primary">{{ user.role }}</span></td>
                <td>{{ user.createdAt | date:'shortDate' }}</td>
              </tr>
              <tr *ngIf="(analytics()?.recentUsers || []).length === 0">
                <td colspan="4" class="text-center text-muted">No users registered yet</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-xl);
      h2 { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-dark); }
    }
  `],
})
export class AdminOverviewComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  analytics = signal<any | null>(null);
  loading = signal(true);
  ngOnInit(): void {
    this.loadAnalytics();
  }
  loadAnalytics(): void {
    this.adminService.getAnalytics().subscribe({
      next: (res) => {
        this.analytics.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
  exportData(): void {
    this.adminService.exportDataToExcel().subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'medbridge_report.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.toastService.success('Report exported successfully');
      },
      error: () => {
        this.toastService.error('Failed to export report');
      },
    });
  }
}
