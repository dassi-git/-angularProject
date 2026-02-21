import { Injectable, inject } from '@angular/core';
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
  private readonly authService = inject(AuthService); // שירות אימות
  private readonly router = inject(Router); // ניווט בין עמודים

  constructor() {}

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
