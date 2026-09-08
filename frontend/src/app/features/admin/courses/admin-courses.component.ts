import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, DatePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { ToastService } from '../../../core/services/toast.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, DatePipe, MatIconModule, MatButtonModule, FormsModule],
  template: `
    <div class="admin-courses animate-fade-in">
      <div class="header-row">
        <h2>Courses Management</h2>
        <button class="btn btn--primary btn--sm" (click)="toggleForm()">
          <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon>
          {{ showForm() ? 'Cancel' : 'Add Course' }}
        </button>
      </div>
      <!-- Add/Edit Course Form -->
      <div class="form-wrapper card" *ngIf="showForm()" style="margin-bottom: var(--space-xl); padding: var(--space-xl);">
        <h3>{{ editMode() ? 'Edit Course' : 'Create New Course' }}</h3>
        <form (ngSubmit)="onSubmit()" class="course-form" #courseForm="ngForm">
          <div class="form-row">
            <div class="form-group">
              <label>Title (English)</label>
              <input type="text" [(ngModel)]="model.title_en" name="title_en" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Title (Arabic)</label>
              <input type="text" [(ngModel)]="model.title_ar" name="title_ar" required class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Description (English)</label>
              <textarea [(ngModel)]="model.description_en" name="description_en" required class="form-textarea"></textarea>
            </div>
            <div class="form-group">
              <label>Description (Arabic)</label>
              <textarea [(ngModel)]="model.description_ar" name="description_ar" required class="form-textarea"></textarea>
            </div>
          </div>
          <div class="form-row" style="grid-template-columns: repeat(3, 1fr);">
            <div class="form-group">
              <label>Price (EGP)</label>
              <input type="number" [(ngModel)]="model.price" name="price" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Duration</label>
              <input type="text" [(ngModel)]="model.duration" name="duration" required placeholder="e.g. 2 Days" class="form-input" />
            </div>
            <div class="form-group">
              <label>Category</label>
              <input type="text" [(ngModel)]="model.category" name="category" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Max Students</label>
              <input type="number" [(ngModel)]="model.maxStudents" name="maxStudents" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Course start date</label><input type="date" [(ngModel)]="model.startDate" name="startDate" class="form-input" /></div>
            <div class="form-group"><label>Course end date</label><input type="date" [(ngModel)]="model.endDate" name="endDate" [min]="model.startDate || null" class="form-input" /></div>
          </div>
          <div class="form-group">
            <label>Image URL</label>
            <input type="text" [(ngModel)]="model.image" name="image" class="form-input" />
          </div>
          <button type="submit" class="btn btn--primary" [disabled]="courseForm.invalid || submitting()">
            {{ editMode() ? 'Update Course' : 'Create Course' }}
          </button>
        </form>
      </div>
      <!-- Course List -->
      <div class="course-toolbar">
        <label for="category-filter">Filter by category</label>
        <select id="category-filter" class="category-filter" [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event)">
          <option value="">All categories ({{ courses().length }})</option>
          <option *ngFor="let category of categories()" [value]="category">{{ category }}</option>
        </select>
        <span class="results-count">{{ filteredCourses().length }} course(s)</span>
      </div>
      <div class="data-table-wrapper card">
        <table>
          <thead>
            <tr>
              <th>Title (EN)</th>
              <th>Category</th>
              <th>Price</th>
              <th>Duration</th>
              <th>Dates</th>
              <th>Max Students</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let course of filteredCourses()">
              <td>{{ course.title_en }}</td>
              <td>{{ course.category }}</td>
              <td>{{ course.price | number:'1.2-2' }} EGP</td>
              <td>{{ course.duration }}</td>
              <td>{{ course.startDate ? (course.startDate | date:'yyyy-MM-dd') : '—' }}<br />{{ course.endDate ? (course.endDate | date:'yyyy-MM-dd') : '—' }}</td>
              <td>{{ course.maxStudents || 'Unlimited' }}</td>
              <td><span class="badge badge--success">{{ course.status }}</span></td>
              <td>
                <button mat-icon-button color="primary" (click)="editCourse(course)"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn" (click)="deleteCourse(course.id)"><mat-icon>delete</mat-icon></button>
              </td>
            </tr>
            <tr *ngIf="filteredCourses().length === 0">
              <td colspan="8" class="text-center text-muted">No courses available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl); }
    h2 { font-size: var(--font-size-2xl); font-weight: 800; color: var(--color-dark); }
    
    .course-form { display: flex; flex-direction: column; gap: var(--space-md); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
    .form-group { display: flex; flex-direction: column; gap: var(--space-xs); }
    .form-input, .form-textarea {
      padding: 10px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      outline: none;
      &:focus { border-color: var(--color-primary); }
    }
    .form-textarea { height: 80px; resize: vertical; }
    .course-toolbar { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin:0 0 var(--space-md); padding:12px 14px; background:var(--color-white); border:1px solid var(--color-border); border-radius:var(--radius-lg); }
    .course-toolbar label { font-weight:700; color:var(--color-dark); }
    .category-filter { min-width:220px; max-width:100%; padding:10px 14px; border:1px solid var(--color-border); border-radius:var(--radius-full); background:var(--color-bg); font:inherit; color:var(--color-dark); }
    .results-count { margin-inline-start:auto; color:var(--color-muted); font-size:var(--font-size-sm); }
    @media (max-width:700px) { .header-row { align-items:flex-start; flex-wrap:wrap; gap:12px; } .header-row h2 { flex:1 1 100%; } .form-row { grid-template-columns:1fr !important; } .course-toolbar { align-items:stretch; } .category-filter { width:100%; } .results-count { margin-inline-start:0; } }
  `],
})
export class AdminCoursesComponent implements OnInit {
  private adminService = inject(AdminService);
  private courseService = inject(CourseService);
  private toastService = inject(ToastService);
  courses = signal<Course[]>([]);
  selectedCategory = signal('');
  categories = computed(() => Array.from(new Set(this.courses().map(course => course.category).filter(Boolean))).sort());
  filteredCourses = computed(() => this.selectedCategory() ? this.courses().filter(course => course.category === this.selectedCategory()) : this.courses());
  showForm = signal(false);
  editMode = signal(false);
  submitting = signal(false);
  model: any = this.emptyModel();
  ngOnInit(): void {
    this.loadCourses();
  }
  loadCourses(): void {
    this.courseService.getCourses({ page: 1, limit: 100 }).subscribe({
      next: (res) => this.courses.set(res.data.courses),
    });
  }
  emptyModel() {
    return {
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      price: 0,
      duration: '',
      category: '',
      maxStudents: null,
      image: '',
      startDate: '',
      endDate: '',
    };
  }
  toggleForm(): void {
    this.showForm.update(v => !v);
    this.editMode.set(false);
    this.model = this.emptyModel();
  }
  editCourse(course: Course): void {
    this.model = { ...course, price: Number(course.price), startDate: this.toDateInput(course.startDate), endDate: this.toDateInput(course.endDate) };
    this.editMode.set(true);
    this.showForm.set(true);
  }
  onSubmit(): void {
    this.submitting.set(true);
    if (this.editMode()) {
      this.adminService.updateCourse(this.model.id, this.model).subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.toastService.success('Course updated successfully');
          this.loadCourses();
        },
        error: () => this.submitting.set(false),
      });
    } else {
      this.adminService.createCourse(this.model).subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.toastService.success('Course created successfully');
          this.loadCourses();
        },
        error: () => this.submitting.set(false),
      });
    }
  }
  deleteCourse(id: string): void {
    if (confirm('Are you sure you want to delete this course?')) {
      this.adminService.deleteCourse(id).subscribe({
        next: () => {
          this.toastService.success('Course deleted successfully');
          this.loadCourses();
        },
      });
    }
  }
  private toDateInput(value?: string | null): string { return value ? new Date(value).toISOString().slice(0, 10) : ''; }
}
