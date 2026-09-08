import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AcademyProfile } from '../models/academy-profile.model';

@Injectable({ providedIn: 'root' })
export class AcademyService {
  private http = inject(HttpClient);
  getProfile(): Observable<{ success: boolean; data: { profile: AcademyProfile } }> {
    return this.http.get<{ success: boolean; data: { profile: AcademyProfile } }>('/api/academy/profile');
  }
  updateProfile(payload: Partial<AcademyProfile>): Observable<{ success: boolean; message: string; data: { profile: AcademyProfile } }> {
    return this.http.put<{ success: boolean; message: string; data: { profile: AcademyProfile } }>('/api/admin/academy-profile', payload);
  }
}
