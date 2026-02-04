import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/Admin';
import { Gift } from '../../models/gift.model'; // ודאי שהנתיב נכון ל-Interface שלך

@Component({
  selector: 'app-raffle-manage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raffle-manage.html',
  styleUrl: './raffle-manage.scss'
})
export class RaffleManage implements OnInit {
  // הזרקת השירות
  private adminService = inject(AdminService);

  // משתנים לניהול הנתונים והתצוגה
  gifts: Gift[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadGifts();
  }

  // טעינת רשימת המתנות מהשרת
  loadGifts(): void {
    this.adminService.getGifts().subscribe({
      next: (data) => {
        this.gifts = data;
      },
      error: (err) => {
        console.error('שגיאה בטעינת מתנות:', err);
      }
    });
  }

  // פונקציה לביצוע ההגרלה
  conductRaffle(giftId: number): void {
    // 1. הפעלת מצב טעינה (נועל את הכפתור ב-HTML)
    this.isLoading = true;

    this.adminService.conductRaffle(giftId).subscribe({
      next: (result) => {
        // השרת אמור להחזיר את פרטי הזוכה
        alert(`ההגרלה הסתיימה! הזוכה במתנה הוא: ${result.winnerName}`);
        
        // 2. כיבוי מצב טעינה
        this.isLoading = false;
        
        // 3. רענון הרשימה כדי לעדכן אם המתנה כבר הוגרלה
        this.loadGifts();
      },
      error: (err) => {
        console.error('שגיאה בביצוע ההגרלה:', err);
        alert('קרתה שגיאה בביצוע ההגרלה. נסה שוב מאוחר יותר.');
        
        // כיבוי מצב טעינה גם במקרה של שגיאה
        this.isLoading = false;
      }
    });
  }
}