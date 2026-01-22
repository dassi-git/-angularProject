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
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  private loadCartFromStorage(): void {
    const saved = localStorage.getItem('cart');
    if (saved) {
      this.cartSubject.next(JSON.parse(saved));
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
    const totalAmount = 0; // יחושב בצד השרת
    
    const order: Order = {
      userId,
      totalAmount,
      isDraft: false, // הזמנה סופית
      orderItems: cart
    };

    return this.createOrder(order);
  }
}