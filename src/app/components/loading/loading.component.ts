import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" *ngIf="loading$ | async">
      <div class="loading-panel">
        <div class="loading-spinner"></div>
        <div class="loading-text">טוען…</div>
      </div>
    </div>
  `,
  styles: [
    `
      .loading-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      .loading-panel {
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        padding: 22px 28px;
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.18);
        min-width: 180px;
      }

      .loading-spinner {
        width: 48px;
        height: 48px;
        border: 5px solid rgba(0, 0, 0, 0.12);
        border-top-color: #2d6cdf;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text {
        color: #2d6cdf;
        font-weight: 600;
        font-size: 1rem;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `
  ]
})
export class LoadingComponent {
  readonly loading$ = this.loadingService.loading$;

  constructor(private loadingService: LoadingService) {}
}
