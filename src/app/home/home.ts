import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [ RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})

export class Home implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // כאן אפשר להוסיף לוגיקה שתרוץ בטעינת הדף (למשל בדיקה אם המשתמש מחובר)
  }

  // פונקציית עזר למקרה שתרצי לנווט דרך כפתור ולא רק דרך לינק ישיר
  navigateToGifts() {
    this.router.navigate(['/catalog']);
  }
logout() {
    // מחיקת נתוני המשתמש (בהתאם לדרך בה את שומרת אותם)
    localStorage.removeItem('user'); 
    localStorage.removeItem('token'); // אם יש לך טוקן
    
    // אופציונלי: ניקוי כל הזיכרון המקומי
    sessionStorage.clear();

    // העברת המשתמש לדף הבית או לדף התחברות
    this.router.navigate(['/login']);
    
    // הודעה קטנה למשתמש (אופציונלי)
    console.log('המשתמש התנתק בהצלחה');
  }
}
