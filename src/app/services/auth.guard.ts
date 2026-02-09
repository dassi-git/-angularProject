import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * שומר נתיבים - מגן על נתיבים שדורשים אימות
 * בודק אם המשתמש מחובר לפני הגישה לנתיב
 */
@Injectable({
  providedIn: 'root' // זמין בכל האפליקציה
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService, // שירות אימות
    private router: Router // ניווט בין עמודים
  ) {}

  /**
   * בודק אם ניתן לגשת לנתיב
   * @returns true אם המשתמש מחובר, אחרת false והפניה לכניסה
   */
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true; // משתמש מחובר - אפשר גישה
    }
    
    // משתמש לא מחובר - הפניה לדף הכניסה
    this.router.navigate(['/login']);
    return false;
  }
}
