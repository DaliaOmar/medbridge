import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, Coupon, CouponValidation } from '../models/course.model';
@Injectable({ providedIn: 'root' })
export class CouponService {
  private http = inject(HttpClient);
  private readonly API = '/api/coupons';
  validate(code: string, courseId?: string): Observable<{ success: boolean; message?: string; errorCode?: string; data: CouponValidation }> {
    return this.http.post<ApiResponse<CouponValidation>>(`${this.API}/validate`, { code, courseId }).pipe(
      map((res) => ({
        success: res.success,
        message: res.message,
        errorCode: res.errorCode,
        data: {
          ...res.data,
          type: res.data?.coupon?.type ?? 'FIXED',
          discount: Number(res.data?.coupon?.discount ?? 0),
        } as CouponValidation,
      }))
    );
  }
  validateCoupon(code: string, courseId?: string): Observable<{ success: boolean; message?: string; errorCode?: string; data: CouponValidation }> {
    return this.validate(code, courseId);
  }
  getAll(): Observable<ApiResponse<{ coupons: Coupon[] }>> {
    return this.http.get<ApiResponse<{ coupons: Coupon[] }>>(this.API);
  }
  getCoupons(): Observable<{ success: boolean; message?: string; errorCode?: string; data: Coupon[] }> {
    return new Observable<{ success: boolean; message?: string; errorCode?: string; data: Coupon[] }>((subscriber) => {
      this.getAll().subscribe({
        next: (res) => {
          subscriber.next({
            success: res.success,
            message: res.message,
            errorCode: res.errorCode,
            data: res.data?.coupons ?? [],
          });
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }
  create(payload: Partial<Coupon>): Observable<ApiResponse<{ coupon: Coupon }>> {
    return this.http.post<ApiResponse<{ coupon: Coupon }>>(this.API, payload);
  }
  createCoupon(payload: Partial<Coupon>): Observable<ApiResponse<{ coupon: Coupon }>> {
    return this.create(payload);
  }
  update(id: string, payload: Partial<Coupon>): Observable<ApiResponse<{ coupon: Coupon }>> {
    return this.http.put<ApiResponse<{ coupon: Coupon }>>(`${this.API}/${id}`, payload);
  }
  updateCouponStatus(id: string, isActive: boolean): Observable<ApiResponse<{ coupon: Coupon }>> {
    return this.update(id, { isActive });
  }
  delete(id: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API}/${id}`);
  }
}
