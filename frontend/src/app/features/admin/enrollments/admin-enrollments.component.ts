import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor, NgClass, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
@Component({
  selector: 'app-admin-enrollments',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, DecimalPipe, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="admin-enrollments animate-fade-in">
      <div class="header-row">
        <h2>Enrollments Management</h2>
        <select class="course-filter" [(ngModel)]="selectedCourseId" (ngModelChange)="loadEnrollments()">
          <option value="">All courses</option>
          <option *ngFor="let course of courses()" [value]="course.id">{{ course.title_en }}</option>
        </select>
      </div>
      <div class="data-table-wrapper card">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Phone</th>
              <th>Course</th>
              <th>Paid</th>
              <th>Coupon</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of enrollments()">
              <td>{{ item.user.firstName }} {{ item.user.lastName }}</td>
              <td><a *ngIf="item.user.phone" [href]="'tel:' + item.user.phone">{{ item.user.phone }}</a><span *ngIf="!item.user.phone">—</span></td>
              <td>{{ item.course.title_en }}</td>
              <td>{{ item.pricePaid | number:'1.2-2' }} EGP</td>
              <td>{{ item.couponUsed || 'None' }}</td>
              <td>{{ item.enrolledAt | date:'medium' }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge--success': item.status === 'CONFIRMED',
                  'badge--warning': item.status === 'PENDING',
                  'badge--error': item.status === 'CANCELLED'
                }">
                  {{ item.status }}
                </span>
              </td>
              <td>
                <button 
                  *ngIf="item.status !== 'CONFIRMED'" 
                  class="btn btn--primary btn--sm" 
                  style="margin-right: 8px;"
                  (click)="updateStatus(item.id, 'CONFIRMED')"
                >
                  Confirm
                </button>
                <button mat-icon-button color="warn" (click)="deleteEnrollment(item.id)" title="Delete enrollment" aria-label="Delete enrollment"><mat-icon>delete</mat-icon></button>
                <button 
                  *ngIf="item.status !== 'CANCELLED'" 
                  class="btn btn--danger btn--sm" 
                  (click)="updateStatus(item.id, 'CANCELLED')"
                >
                  Cancel
                </button>
              </td>
            </tr>
            <tr *ngIf="enrollments().length === 0">
              <td colspan="8" class="text-center text-muted">No enrollments found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); }
    .course-filter { min-width: 240px; padding: 10px 14px; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-white); font: inherit; }
    @media (max-width: 640px) { .header-row { flex-direction: column; align-items: stretch; gap: 12px; } .course-filter { width: 100%; } }
    h2 { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-dark); }
  `],
})
export class AdminEnrollmentsComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  private courseService = inject(CourseService);
  enrollments = signal<any[]>([]);
  courses = signal<Course[]>([]);
  selectedCourseId = '';
  ngOnInit(): void {
    this.courseService.getCourses({ page: 1, limit: 100, status: 'ALL' }).subscribe({ next: res => this.courses.set(res.data.courses) });
    this.loadEnrollments();
  }
  loadEnrollments(): void {
    this.adminService.getEnrollments({ courseId: this.selectedCourseId || undefined }).subscribe({
      next: (res) => this.enrollments.set(res.data),
    });
  }
  updateStatus(id: string, status: 'CONFIRMED' | 'CANCELLED'): void {
    this.adminService.updateEnrollmentStatus(id, status).subscribe({
      next: () => {
        this.toastService.success(`Enrollment status updated to ${status}`);
        this.loadEnrollments();
      },
    });
  }
  deleteEnrollment(id: string): void {
    if (!confirm('Delete this enrollment permanently?')) return;
    this.adminService.deleteEnrollment(id).subscribe({ next: () => { this.toastService.success('Enrollment deleted successfully'); this.loadEnrollments(); }, error: (err) => this.toastService.error(err.error?.message || 'Could not delete enrollment') });
  }
}
