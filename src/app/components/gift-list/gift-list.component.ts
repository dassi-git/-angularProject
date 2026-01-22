import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiftService } from '../../services';
import { Gift } from '../../models';

/**
 * רכיב להצגת רשימת מתנות
 * מציג כרטיסי מתנות עם אפשרויות מיון וסינון
 */
@Component({
  selector: 'app-gift-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './gift-list.component.html',
  styleUrl: './gift-list.component.css',
  changeDetection: ChangeDetectionStrategy.Default // אסטרטגיית זיהוי שינויים רגילה
})
export class GiftListComponent implements OnInit {
  // מערכי נתונים
  gifts: Gift[] = []; // כל המתנות מהשרת
  filteredGifts: Gift[] = []; // מתנות מסוננות לתצוגה
  
  // מצבי ממשק משתמש
  isLoading = false; // האם בתהליך טעינה
  errorMessage = ''; // הודעת שגיאה
  
  // הגדרות מיון
  sortBy: 'price' | 'category' | 'name' = 'name'; // שדה המיון הנוכחי
  sortOrder: 'asc' | 'desc' = 'asc'; // כיוון המיון (עולה/יורד)
  
  // הגדרות סינון
  selectedCategory = ''; // קטגוריה נבחרת לסינון
  categories: string[] = []; // רשימת כל הקטגוריות הזמינות

  constructor(
    private giftService: GiftService, // שירות לטעינת מתנות
    private cdr: ChangeDetectorRef // לזיהוי שינויים ידני
  ) {
    console.log('GiftListComponent constructor');
  }

  /**
   * פונקציה שרצה בעת אתחול הרכיב
   */
  ngOnInit(): void {
    console.log('GiftListComponent ngOnInit');
    this.loadGifts();
  }

  /**
   * טוען את רשימת המתנות מהשרת
   */
  loadGifts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('Loading gifts...');

    this.giftService.getGifts().subscribe({
      next: (gifts) => {
        console.log('Gifts loaded:', gifts);
        this.gifts = gifts || [];
        this.filteredGifts = [...this.gifts]; // יצירת עותק למתנות מסוננות
        this.extractCategories(); // חילוץ קטגוריות ייחודיות
        this.sortGifts(); // מיון ראשוני
        this.isLoading = false;
        this.cdr.detectChanges(); // עדכון ממשק המשתמש
        console.log('Loading completed, isLoading:', this.isLoading);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading gifts:', error);
        
        // טיפול בסוגי שגיאות שונים
        if (error.status === 401) {
          this.errorMessage = 'נדרשת התחברות מחדש';
        } else if (error.status === 403) {
          this.errorMessage = 'אין הרשאה לצפות במתנות';
        } else if (error.status === 0) {
          this.errorMessage = 'בעיית חיבור לשרת';
        } else {
          this.errorMessage = `שגיאה בטעינת המתנות (${error.status || 'לא ידוע'})`;
        }
      }
    });
  }

  /**
   * מחלץ רשימת קטגוריות ייחודיות מהמתנות
   */
  extractCategories(): void {
    const categorySet = new Set(this.gifts.map(gift => gift.category));
    this.categories = Array.from(categorySet).sort();
  }

  /**
   * מופעל כאשר משתנה שדה המיון
   */
  onSortChange(): void {
    this.sortGifts();
  }

  /**
   * מופעל כאשר משתנה הקטגוריה לסינון
   */
  onCategoryFilter(): void {
    if (this.selectedCategory) {
      // סינון לפי קטגוריה נבחרת
      this.filteredGifts = this.gifts.filter(gift => gift.category === this.selectedCategory);
    } else {
      // הצגת כל המתנות
      this.filteredGifts = [...this.gifts];
    }
    this.sortGifts(); // מיון מחדש אחרי הסינון
  }

  /**
   * ממיין את המתנות לפי השדה והכיוון הנבחרים
   */
  sortGifts(): void {
    this.filteredGifts.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortBy) {
        case 'price':
          comparison = a.ticketPrice - b.ticketPrice;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category, 'he'); // השוואה בעברית
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name, 'he'); // השוואה בעברית
          break;
      }
      
      // החזרת התוצאה לפי כיוון המיון
      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * הופך את כיוון המיון (עולה/יורד)
   */
  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortGifts();
  }

  /**
   * פונקציה לזיהוי ייחודי של מתנות ברשימה (לביצועים)
   */
  trackByGiftId(index: number, gift: Gift): number {
    return gift.id;
  }
}