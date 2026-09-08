import { Component, OnInit, inject, signal } from '@angular/core';
import { NgIf, NgFor, NgClass, DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';
import { ToastService } from '../../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, DatePipe, MatIconModule, MatButtonModule],
  template: `
    <div class="admin-users animate-fade-in">
      <div class="header-row">
        <h2>Users Management</h2>
      </div>
      <div class="data-table-wrapper card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users()">
              <td>{{ user.firstName }} {{ user.lastName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.phone || 'N/A' }}</td>
              <td>
                <span class="badge" [ngClass]="user.role === 'ADMIN' ? 'badge--success' : 'badge--primary'">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span class="badge" [ngClass]="user.isActive ? 'badge--success' : 'badge--error'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ user.createdAt | date:'shortDate' }}</td>
              <td>
                <button 
                  class="btn btn--outline btn--sm" 
                  style="margin-right: 8px;"
                  (click)="toggleUserRole(user)"
                >
                  Make {{ user.role === 'ADMIN' ? 'User' : 'Admin' }}
                </button>
                <button 
                  class="btn btn--sm" 
                  [ngClass]="user.isActive ? 'btn--danger' : 'btn--primary'"
                  (click)="toggleUserStatus(user)"
                >
                  {{ user.isActive ? 'Deactivate' : 'Activate' }}
                </button>
                <button *ngIf="user.role !== 'ADMIN'" mat-icon-button color="warn" (click)="deleteUser(user)" title="Delete user" aria-label="Delete user"><mat-icon>delete</mat-icon></button>
              </td>
            </tr>
            <tr *ngIf="users().length === 0">
              <td colspan="7" class="text-center text-muted">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); }
    h2 { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-dark); }
  `],
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);
  users = signal<User[]>([]);
  ngOnInit(): void {
    this.loadUsers();
  }
  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (res) => this.users.set(res.data),
    });
  }
  toggleUserRole(user: User): void {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.adminService.updateUserRole(user.id, nextRole).subscribe({
      next: () => {
        this.toastService.success(`User role updated to ${nextRole}`);
        this.loadUsers();
      },
    });
  }
  toggleUserStatus(user: User): void {
    const nextStatus = !user.isActive;
    this.adminService.updateUserStatus(user.id, nextStatus).subscribe({
      next: () => {
        this.toastService.success(`User is now ${nextStatus ? 'active' : 'inactive'}`);
        this.loadUsers();
      },
    });
  }
  deleteUser(user: User): void {
    if (!confirm(`Delete ${user.firstName} ${user.lastName} and all related records?`)) return;
    this.adminService.deleteUser(user.id).subscribe({ next: () => { this.toastService.success('User deleted successfully'); this.loadUsers(); }, error: (err) => this.toastService.error(err.error?.message || 'Could not delete user') });
  }
}
