import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-purchases-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchases-report.component.html',
  styleUrls: ['./purchases-report.component.css']
})
export class PurchasesReportComponent implements OnInit {
  private orderService = inject(OrderService);
  private cdr = inject(ChangeDetectorRef);
  
  purchases: any[] = [];
  isLoading = true;

  constructor() {

  }

  ngOnInit(): void {

    this.loadPurchases();
  }

  loadPurchases(): void {
    this.isLoading = true;

    
    this.orderService.getAllOrders().subscribe({
      next: (data) => {

        this.purchases = data; // כל ההזמנות

        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('שגיאה בטעינת הזמנות:', err);
        this.purchases = [];
        this.isLoading = false;
      },
      complete: () => {

      }
    });
  }

  confirmOrder(orderId: number): void {
    if (!confirm('האם לאשר הזמנה זו?')) return;
    
    this.orderService.confirmOrderById(orderId).subscribe({
      next: () => {
        alert('ההזמנה אושרה בהצלחה');
        this.loadPurchases();
      },
      error: (err) => {
        console.error('שגיאה באישור הזמנה:', err);
        alert('שגיאה באישור ההזמנה');
      }
    });
  }
}
