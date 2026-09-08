import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Enrollment } from '../models/course.model';
@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private http = inject(HttpClient);
  private readonly API = '/api/enrollments';
  enroll(courseIdOrPayload: string | { courseId: string; couponCode?: string }, couponCode?: string): Observable<ApiResponse<{ enrollment: Enrollment }>> {
    const payload = typeof courseIdOrPayload === 'string'
      ? { courseId: courseIdOrPayload, couponCode }
      : courseIdOrPayload;
    return this.http.post<ApiResponse<{ enrollment: Enrollment }>>(this.API, payload);
  }
  getMyEnrollments(): Observable<{ success: boolean; message?: string; errorCode?: string; data: Enrollment[] }> {
    return new Observable<{ success: boolean; message?: string; errorCode?: string; data: Enrollment[] }>((subscriber) => {
      this.http.get<ApiResponse<{ enrollments: Enrollment[] }>>(`${this.API}/my`).subscribe({
        next: (res) => {
          subscriber.next({
            success: res.success,
            message: res.message,
            errorCode: res.errorCode,
            data: res.data?.enrollments ?? [],
          });
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }
  getAllEnrollments(params?: { page?: number; limit?: number; status?: string }): Observable<ApiResponse<{ enrollments: Enrollment[]; pagination: unknown }>> {
    let url = this.API;
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.status) query.set('status', params.status);
    if (query.toString()) url += `?${query.toString()}`;
    return this.http.get<ApiResponse<{ enrollments: Enrollment[]; pagination: unknown }>>(url);
  }
  updateStatus(id: string, status: string): Observable<ApiResponse<{ enrollment: Enrollment }>> {
    return this.http.patch<ApiResponse<{ enrollment: Enrollment }>>(`${this.API}/${id}/status`, { status });
  }
  updateEnrollmentStatus(id: string, status: string): Observable<ApiResponse<{ enrollment: Enrollment }>> {
    return this.updateStatus(id, status);
  }
  cancelMyEnrollment(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API}/my/${id}`);
  }
}
