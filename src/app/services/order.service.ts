import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
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

  private currentDraftOrderId: number | null = null;

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
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user in addToCartAsync:', currentUser);
    
    if (!currentUser) {
      throw new Error('משתמש לא מחובר');
    }

    const userId: number = currentUser.id !== undefined ? currentUser.id : 1;
    console.log('Using userId:', userId);

    // אם יש הזמנת טיוטה קיימת, נוסיף לה פריט
    if (this.currentDraftOrderId) {
      return this.addItemToExistingOrder(this.currentDraftOrderId, giftId, quantity);
    }

    // אחרת, ניצור הזמנה חדשה
    const orderRequest = {
      userId: userId,
      totalAmount: 0.01,
      isDraft: true,
      orderItems: [
        {
          giftId: giftId,
          quantity: quantity
        }
      ]
    };

    return this.http.post(`${this.apiUrl}/Order/checkout`, orderRequest).pipe(
      tap((response: any) => {
        if (response.orderId) {
          this.currentDraftOrderId = response.orderId;
          localStorage.setItem('currentDraftOrderId', response.orderId.toString());
        }
      })
    );
  }

  addItemToExistingOrder(orderId: number, giftId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Order/${orderId}/add-item`, {
      giftId: giftId,
      quantity: quantity
    }, { responseType: 'text' });
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
    this.currentDraftOrderId = null;
    localStorage.removeItem('currentDraftOrderId');
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
    
    // טעינת מזהה ההזמנה הנוכחית
    const savedOrderId = localStorage.getItem('currentDraftOrderId');
    if (savedOrderId) {
      this.currentDraftOrderId = parseInt(savedOrderId);
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

  /// <summary>קריאה ל-Endpoint ההיסטוריה של הזמנות משתמש</summary>
  getUserOrderHistory(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Order/user/history/${userId}`);
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Order/all`);
  }

  confirmOrder(userId: number, totalAmount: number): Observable<any> {
    // אם יש הזמנת טיוטה קיימת, נאשר אותה
    if (this.currentDraftOrderId) {
      return this.confirmOrderById(this.currentDraftOrderId).pipe(
        tap(() => {
          this.currentDraftOrderId = null;
          localStorage.removeItem('currentDraftOrderId');
          this.clearCart();
        })
      );
    }
    
    // אחרת, ניצור הזמנה חדשה מאושרת
    const cart = this.getCart();
    
    if (cart.length === 0) {
      throw new Error('הסל ריק');
    }
    
    const orderRequest = {
      userId: userId,
      totalAmount: totalAmount,
      isDraft: false,
      orderItems: cart.map(item => ({
        giftId: item.giftId,
        quantity: item.quantity
      }))
    };

    return this.http.post(`${this.apiUrl}/Order/checkout`, orderRequest).pipe(
      tap(() => this.clearCart())
    );
  }

  confirmOrderById(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Order/confirm/${orderId}`, {}, { responseType: 'text' });
  }
}