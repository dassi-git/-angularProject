import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from "../../services/Admin";

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-dashboard.html',
  styleUrls: ['./report-dashboard.scss']
})
export class ReportDashboard implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  revenueReport = {
    totalRevenue: 0,
    totalOrders: 0,
    totalTicketsSold: 0
  };

  giftsWithWinners: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminService.getRevenueReport().subscribe({
      next: (data) => {
        this.revenueReport = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'שגיאה בטעינת דוח ההכנסות';
        this.cdr.detectChanges();
      }
    });

    this.adminService.getGiftsWithWinners().subscribe({
      next: (data) => {
        this.giftsWithWinners = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'שגיאה בטעינת רשימת המתנות';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // פונקציה לחישוב סכום כולל של הכנסות עבור מתנה
  getTotalRevenue(gift: any): number {
    if (!gift.orderItems) return 0;
    return gift.orderItems.reduce((sum: number, item: any) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
  }
}
