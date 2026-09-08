import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, RegisterPayload, LoginPayload } from '../models/user.model';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'mb_token';
  private readonly USER_KEY = 'mb_user';
  private readonly API = '/api/auth';
  private _currentUser = signal<User | null>(this.loadStoredUser());
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this._currentUser());
  readonly isAdmin = computed(() => this._currentUser()?.role === 'ADMIN');
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }
  private loadStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, payload).pipe(
      tap(res => {
        if (res.success) this.storeSession(res);
      })
    );
  }
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, payload).pipe(
      tap(res => {
        if (res.success) this.storeSession(res);
      })
    );
  }
  getMe(): Observable<{ success: boolean; data: { user: User } }> {
    return this.http.get<{ success: boolean; data: { user: User } }>(`${this.API}/me`).pipe(
      tap(res => {
        if (res.success) {
          this._currentUser.set(res.data.user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.user));
        }
      })
    );
  }
  updateProfile(payload: Partial<User>): Observable<{ success: boolean; message: string; data: { user: User } }> {
    return this.http.put<{ success: boolean; message: string; data: { user: User } }>(`${this.API}/profile`, payload).pipe(
      tap(res => {
        if (res.success) {
          this._currentUser.set(res.data.user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.user));
        }
      })
    );
  }
  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.API}/change-password`, payload);
  }
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
  }
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  private storeSession(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.data.user));
    this._currentUser.set(res.data.user);
  }
}
