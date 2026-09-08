import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, Wishlist } from '../models/course.model';
@Injectable({ providedIn: 'root' })
export class WishlistService {
  private http = inject(HttpClient);
  private readonly API = '/api/wishlist';
  getMyWishlist(): Observable<ApiResponse<{ wishlists: Wishlist[] }>> {
    return this.http.get<ApiResponse<{ wishlists: Wishlist[] }>>(this.API);
  }
  getWishlist(): Observable<{ success: boolean; message?: string; errorCode?: string; data: Wishlist[] }> {
    return new Observable<{ success: boolean; message?: string; errorCode?: string; data: Wishlist[] }>((subscriber) => {
      this.getMyWishlist().subscribe({
        next: (res) => {
          subscriber.next({
            success: res.success,
            message: res.message,
            errorCode: res.errorCode,
            data: res.data?.wishlists ?? [],
          });
          subscriber.complete();
        },
        error: (err) => subscriber.error(err),
      });
    });
  }
  toggle(courseId: string): Observable<ApiResponse<{ inWishlist: boolean }>> {
    return this.http.post<ApiResponse<{ inWishlist: boolean }>>(`${this.API}/toggle`, { courseId });
  }
  addToWishlist(courseId: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.API, { courseId });
  }
  removeFromWishlist(courseId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.API}/${courseId}`);
  }
  add(courseId: string): Observable<ApiResponse> {
    return this.addToWishlist(courseId);
  }
  remove(courseId: string): Observable<ApiResponse> {
    return this.removeFromWishlist(courseId);
  }
}
