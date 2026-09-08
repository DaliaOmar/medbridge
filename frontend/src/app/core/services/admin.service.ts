import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, Course, Enrollment, Coupon } from '../models/course.model';
import { User } from '../models/user.model';
export interface AnalyticsData {
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    activeCourses: number;
    totalRevenue: number;
    confirmedEnrollments: number;
    pendingEnrollments: number;
    cancelledEnrollments: number;
  };
  recentEnrollments: Enrollment[];
  recentUsers: User[];
  topCourses: Course[];
  monthlyEnrollments: { month: string; count: number }[];
}
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly API = '/api/admin';
  getAnalytics(): Observable<ApiResponse<AnalyticsData>> {
    return this.http.get<ApiResponse<AnalyticsData>>(`${this.API}/analytics`);
  }
  getUsers(params?: { page?: number; limit?: number; search?: string; role?: string }): Observable<{ success: boolean; message?: string; errorCode?: string; data: User[] }> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.role) httpParams = httpParams.set('role', params.role);
    return this.http.get<ApiResponse<{ users: User[]; pagination: unknown }>>(`${this.API}/users`, { params: httpParams }).pipe(
      map((res) => ({
        success: res.success,
        message: res.message,
        errorCode: res.errorCode,
        data: res.data?.users ?? [],
      }))
    );
  }
  updateUser(id: string, payload: { role?: string; isActive?: boolean }): Observable<ApiResponse<{ user: User }>> {
    return this.http.patch<ApiResponse<{ user: User }>>(`${this.API}/users/${id}`, payload);
  }
  updateUserRole(id: string, role: 'ADMIN' | 'USER'): Observable<ApiResponse<{ user: User }>> {
    return this.updateUser(id, { role });
  }
  updateUserStatus(id: string, isActive: boolean): Observable<ApiResponse<{ user: User }>> {
    return this.updateUser(id, { isActive });
  }
  deleteUser(id: string): Observable<ApiResponse> { return this.http.delete<ApiResponse>(`${this.API}/users/${id}`); }
  getCourses(params?: { page?: number; limit?: number; search?: string; status?: string; category?: string }): Observable<{ success: boolean; message?: string; errorCode?: string; data: { courses: Course[]; total: number } }> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.category) httpParams = httpParams.set('category', params.category);
    return this.http.get<ApiResponse<{ courses: Course[]; pagination?: { total: number } }>>('/api/courses', { params: httpParams }).pipe(
      map((res) => ({
        success: res.success,
        message: res.message,
        errorCode: res.errorCode,
        data: {
          courses: res.data?.courses ?? [],
          total: res.data?.pagination?.total ?? (res.data?.courses?.length ?? 0),
        },
      }))
    );
  }
  createCourse(payload: Partial<Course>): Observable<ApiResponse<{ course: Course }>> {
    return this.http.post<ApiResponse<{ course: Course }>>('/api/courses', payload);
  }
  updateCourse(id: string, payload: Partial<Course>): Observable<ApiResponse<{ course: Course }>> {
    return this.http.put<ApiResponse<{ course: Course }>>(`/api/courses/${id}`, payload);
  }
  deleteCourse(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`/api/courses/${id}`);
  }
  getCoupons(): Observable<{ success: boolean; message?: string; errorCode?: string; data: Coupon[] }> {
    return this.http.get<ApiResponse<{ coupons: Coupon[] }>>('/api/coupons').pipe(
      map((res) => ({
        success: res.success,
        message: res.message,
        errorCode: res.errorCode,
        data: res.data?.coupons ?? [],
      }))
    );
  }
  createCoupon(payload: Partial<Coupon>): Observable<ApiResponse<{ coupon: Coupon }>> {
    return this.http.post<ApiResponse<{ coupon: Coupon }>>('/api/coupons', payload);
  }
  updateCouponStatus(id: string, isActive: boolean): Observable<ApiResponse<{ coupon: Coupon }>> {
    return this.http.put<ApiResponse<{ coupon: Coupon }>>(`/api/coupons/${id}`, { isActive });
  }
  deleteCoupon(id: string): Observable<ApiResponse> { return this.http.delete<ApiResponse>(`/api/coupons/${id}`); }
  getEnrollments(params?: { courseId?: string }): Observable<{ success: boolean; message?: string; errorCode?: string; data: Enrollment[] }> {
    let httpParams = new HttpParams();
    if (params?.courseId) httpParams = httpParams.set('courseId', params.courseId);
    return this.http.get<ApiResponse<{ enrollments: Enrollment[] }>>('/api/enrollments', { params: httpParams }).pipe(
      map((res) => ({
        success: res.success,
        message: res.message,
        errorCode: res.errorCode,
        data: res.data?.enrollments ?? [],
      }))
    );
  }
  updateEnrollmentStatus(id: string, status: string): Observable<ApiResponse<{ enrollment: Enrollment }>> {
    return this.http.patch<ApiResponse<{ enrollment: Enrollment }>>(`/api/enrollments/${id}/status`, { status });
  }
  deleteEnrollment(id: string): Observable<ApiResponse> { return this.http.delete<ApiResponse>(`/api/enrollments/${id}`); }
  exportDataToExcel(): Observable<Blob> {
    return this.http.get(`${this.API}/export?type=all`, { responseType: 'blob' });
  }
  exportData(type: 'enrollments' | 'users' | 'courses' | 'all'): void {
    window.open(`${this.API}/export?type=${type}`, '_blank');
  }
}
