import { Injectable, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastr = inject(ToastrService);
  private prepare(): void { this.toastr.clear(); }
  success(message: string, title = 'Success'): void {
    this.prepare();
    this.toastr.success(message, title, {
      timeOut: 4000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true,
    });
  }
  error(message: string, title = 'Error'): void {
    this.prepare();
    this.toastr.error(message, title, {
      timeOut: 5000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true,
    });
  }
  info(message: string, title = 'Info'): void {
    this.prepare();
    this.toastr.info(message, title, {
      timeOut: 4000,
      positionClass: 'toast-top-right',
      progressBar: true,
    });
  }
  warning(message: string, title = 'Warning'): void {
    this.prepare();
    this.toastr.warning(message, title, {
      timeOut: 4000,
      positionClass: 'toast-top-right',
      progressBar: true,
    });
  }
}
