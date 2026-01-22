import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order, OrderItem, Gift, CreateOrderRequest } from '../models';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

/**
 * שירות לניהול הזמנות וסל קניות
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  private cartSubject = new BehaviorSubject<OrderItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService // לקבלת פרטי המשתמש המחובר
  ) {
    this.loadCartFromStorage();
    
    // ניקוי הסל כשמשתמש מתנתק
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.clearCart();
      } else {
        // טעינת סל ספציפי למשתמש
        this.loadUserCart(user.id || user.email);
      }
    });
  }

  /**
   * מוסיף מתנה לסל הקניות דרך ה-API
   * משתמש ב-checkout endpoint עם IsDraft = true
   */
  addToCartAsync(giftId: number, quantity: number = 1): Observable<any> {
    console.log('פונקציית addToCartAsync נקראת');
    
    const currentUser = this.authService.getCurrentUser();
    console.log('משתמש נוכחי:', currentUser);
    
    if (!currentUser) {
      const errorMsg = 'משתמש לא מחובר';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // חילוץ UserId
    let userId: number = 1;
    
    if (currentUser.id) {
      userId = currentUser.id;
    } else if (currentUser.email && !isNaN(parseInt(currentUser.email))) {
      userId = parseInt(currentUser.email);
    }

    // יצירת הזמנה עם IsDraft = true (סל קניות)
    const orderRequest = {
      userId: userId,
      totalAmount: 0, // יחושב בשרת
      isDraft: true, // טיוטה - סל קניות
      orderItems: [
        {
          giftId: giftId,
          quantity: quantity
        }
      ]
    };

    console.log('שליחת בקשה ל-checkout:', orderRequest);
    console.log('URL:', `${this.apiUrl}/Order/checkout`);
    
    return this.http.post(`${this.apiUrl}/Order/checkout`, orderRequest);
  }

  // סל קניות (טיוטה) - פונקציות מקומיות
  getCart(): OrderItem[] {
    return this.cartSubject.value;
  }

  /**
   * מוסיף פריט לסל המקומי עם נתוני המתנה
   */
  addToCart(giftId: number, quantity: number = 1, giftData?: Gift): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.giftId === giftId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: any = { giftId, quantity };
      // שמירת נתוני המתנה אם סופקו
      if (giftData) {
        newItem.giftData = giftData;
      }
      cart.push(newItem);
    }
    
    this.updateCart(cart);
    console.log('סל מקומי עודכן:', cart);
  }

  removeFromCart(giftId: number): void {
    const cart = this.getCart().filter(item => item.giftId !== giftId);
    this.updateCart(cart);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  /**
   * מעדכן את הסל ומעדכן את כל המקשיבים
   */
  private updateCart(cart: OrderItem[]): void {
    console.log('מעדכן סל:', cart);
    this.cartSubject.next(cart);
    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const userId = currentUser.id || currentUser.email;
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  }

  private loadCartFromStorage(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.cartSubject.next([]);
      return;
    }
    
    const userId = currentUser.id || currentUser.email;
    const saved = localStorage.getItem(`cart_${userId}`);
    if (saved) {
      this.cartSubject.next(JSON.parse(saved));
    } else {
      this.cartSubject.next([]);
    }
  }

  private loadUserCart(userId: any): void {
    const saved = localStorage.getItem(`cart_${userId}`);
    if (saved) {
      this.cartSubject.next(JSON.parse(saved));
    } else {
      this.cartSubject.next([]);
    }
  }

  // הזמנות
  createOrder(order: Order): Observable<any> {
    return this.http.post(`${this.apiUrl}/Order`, order);
  }

  getUserOrders(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Order/user/${userId}`);
  }

  confirmOrder(userId: number): Observable<any> {
    const cart = this.getCart();
    
    if (cart.length === 0) {
      throw new Error('הסל ריק');
    }
    
    const orderRequest = {
      userId: userId,
      totalAmount: 0, // יחושב בשרת
      isDraft: false, // הזמנה סופית
      orderItems: cart.map(item => ({
        giftId: item.giftId,
        quantity: item.quantity
      }))
    };

    console.log('שליחת בקשת אישור רכישה:', orderRequest);
    
    return this.http.post(`${this.apiUrl}/Order/checkout`, orderRequest);
  }
}