import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Course, CourseListResponse, ApiResponse, Pagination } from '../models/course.model';
@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private readonly API = '/api/courses';
  getCategories(): Observable<{ success: boolean; data: { categories: string[] } }> {
    return this.http.get<{ success: boolean; data: { categories: string[] } }>(`${this.API}/categories`);
  }
  getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Observable<CourseListResponse> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page.toString());
    if (params?.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.category) httpParams = httpParams.set('category', params.category);
    return this.http.get<CourseListResponse>(this.API, { params: httpParams });
  }
  getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    category?: string;
  }): Observable<{ success: boolean; message?: string; errorCode?: string; data: { courses: Course[]; total: number; pagination: Pagination } }> {
    return this.getAll(params).pipe(
      map((res) => ({
        success: res.success,
        data: {
          courses: res.data.courses,
          total: res.data.pagination.total,
          pagination: res.data.pagination,
        },
      }))
    );
  }
  getById(id: string): Observable<ApiResponse<{ course: Course }>> {
    return this.http.get<ApiResponse<{ course: Course }>>(`${this.API}/${id}`);
  }
  getCourse(id: string): Observable<{ success: boolean; message?: string; errorCode?: string; data: Course }> {
    return new Observable<{ success: boolean; message?: string; errorCode?: string; data: Course }>((subscriber) => {
      this.getById(id).subscribe({
        next: (res) => {
          subscriber.next({
            success: res.success,
            message: res.message,
            errorCode: res.errorCode,
            data: res.data!.course,
          });
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }
  getDetailWithUserData(id: string): Observable<ApiResponse<{ course: Course; isInWishlist: boolean; isEnrolled: boolean }>> {
    return this.http.get<ApiResponse<{ course: Course; isInWishlist: boolean; isEnrolled: boolean }>>(`${this.API}/${id}/detail`);
  }
  create(payload: Partial<Course>): Observable<ApiResponse<{ course: Course }>> {
    return this.http.post<ApiResponse<{ course: Course }>>(this.API, payload);
  }
  update(id: string, payload: Partial<Course>): Observable<ApiResponse<{ course: Course }>> {
    return this.http.put<ApiResponse<{ course: Course }>>(`${this.API}/${id}`, payload);
  }
  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API}/${id}`);
  }
}
