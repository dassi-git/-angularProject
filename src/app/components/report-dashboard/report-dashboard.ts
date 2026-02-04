import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from "../../services/Admin" ; // הנתיב לסרביס שלך

@Component({
  selector: 'app-report-dashboard',
  standalone: true,
  imports: [CommonModule], // מאפשר שימוש ב-pipes ובדירקטיבות בסיסיות
  templateUrl: './report-dashboard.html',
  styleUrls: ['./report-dashboard.scss']
})
export class ReportDashboard implements OnInit {
  // 1. הזרקת השירות (Service)
  private adminService = inject(AdminService);

  // 2. הגדרת מבנה הנתונים (עם ערכי ברירת מחדל)
  revenueReport = {
    totalRevenue: 0,
    totalOrders: 0,
    totalTickets: 0
  };

  winners: any[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    // ברגע שהקומפוננטה עולה - נטען את הנתונים
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;

    // קריאה לשירות לקבלת דוח הכנסות
    this.adminService.getRevenueReport().subscribe({
      next: (data) => {
        this.revenueReport = data;
      },
      error: (err) => console.error('שגיאה בטעינת דוחות:', err)
    });

    // קריאה לשירות לקבלת רשימת הזוכים
    this.adminService.getWinners().subscribe({
      next: (data) => {
        this.winners = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('שגיאה בטעינת זוכים:', err);
        this.isLoading = false;
      }
    });
  }
}