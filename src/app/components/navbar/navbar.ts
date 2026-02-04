import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  // הזרקת השירותים
  public authService = inject(AuthService);
  private router = inject(Router);

  /**
   * לוגיקת התנתקות:
   * 1. קריאה לשירות שינקה את ה-Signal ואת ה-LocalStorage
   * 2. ניווט המשתמש לדף הבית או לדף התחברות
   */
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * הערה: אין צורך במשתנים מקומיים כמו isLoggedIn.
   * אנחנו ניגש ישירות ל-authService.isLoggedIn() ב-HTML
   * כי זה Signal וזה הכי יעיל מבחינת ביצועים.
   */
}
