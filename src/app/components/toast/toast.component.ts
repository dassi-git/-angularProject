import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts" 
           class="toast toast-{{toast.type}}">
        <div class="toast-icon">
          <span *ngIf="toast.type === 'success'">✓</span>
          <span *ngIf="toast.type === 'error'">✕</span>
          <span *ngIf="toast.type === 'info'">ℹ</span>
          <span *ngIf="toast.type === 'warning'">⚠</span>
        </div>
        <div class="toast-message">{{ toast.message }}</div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 90%;
      width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      color: white;
      font-weight: 500;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .toast-success {
      background: linear-gradient(135deg, #28a745, #20c997);
    }

    .toast-error {
      background: linear-gradient(135deg, #dc3545, #c82333);
    }

    .toast-info {
      background: linear-gradient(135deg, #17a2b8, #138496);
    }

    .toast-warning {
      background: linear-gradient(135deg, #ffc107, #e0a800);
      color: #333;
    }

    .toast-icon {
      font-size: 24px;
      font-weight: bold;
    }

    .toast-message {
      flex: 1;
    }

    @media (max-width: 576px) {
      .toast-container {
        width: 95%;
        top: 70px;
      }

      .toast {
        padding: 12px 16px;
        font-size: 0.9rem;
      }

      .toast-icon {
        font-size: 20px;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastService.toast$.subscribe(toast => {
      this.toasts.push(toast);
      setTimeout(() => {
        this.toasts.shift();
      }, toast.duration || 3000);
    });
  }
}
