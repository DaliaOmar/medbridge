import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        const errorCode = error.error?.errorCode;
        if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
          authService.logout();
          router.navigate(['/auth/login']);
          toastService.error('Your session has expired. Please log in again.');
        }
      } else if (error.status === 403) {
        toastService.error('You do not have permission to perform this action.');
      } else if (error.status === 0) {
        toastService.error('Cannot connect to server. Please check your connection.');
      } else if (error.status >= 500) {
        toastService.error('A server error occurred. Please try again later.');
      }
      return throwError(() => error);
    })
  );
};
