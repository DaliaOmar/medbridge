import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, TranslateModule, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found animate-fade-in">
      <div class="not-found__content">
        <mat-icon class="not-found__icon">error_outline</mat-icon>
        <h1 class="not-found__title">404</h1>
        <p class="not-found__text">
          Oops! The page you are looking for does not exist.
        </p>
        <a routerLink="/" mat-raised-button color="primary">
          <mat-icon>home</mat-icon>
          Go to Home
        </a>
      </div>
    </div>
  `,
  styles: [`
    .not-found {
      min-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-2xl);
      &__content {
        text-align: center;
        max-width: 480px;
        a {
          margin-top: var(--space-xl);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
      }
      &__icon {
        font-size: 80px;
        width: 80px;
        height: 80px;
        color: var(--color-error);
        margin-bottom: var(--space-lg);
      }
      &__title {
        font-size: 96px;
        font-weight: 900;
        line-height: 1;
        color: var(--color-dark);
        margin-bottom: var(--space-md);
      }
      &__text {
        font-size: var(--font-size-lg);
        color: var(--color-muted);
        margin-bottom: var(--space-xl);
      }
    }
  `],
})
export class NotFoundComponent {}
