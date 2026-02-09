import { Component, inject, OnInit } from '@angular/core';
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
export class NavbarComponent implements OnInit {
  // הזרקת השירותים
  public authService = inject(AuthService);
  private router = inject(Router);
  
  isDarkMode = false;

  ngOnInit() {
    // טעינת מצב Dark Mode מ-localStorage
    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';

    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#111827';
      document.body.style.color = '#f9fafb';
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
      document.body.style.backgroundColor = '#111827';
      document.body.style.color = '#f9fafb';
      localStorage.setItem('theme', 'dark');

    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.removeAttribute('data-theme');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
      localStorage.setItem('theme', 'light');

    }
  }

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
