import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Order, OrderItem, Gift, CreateOrderRequest } from '../models';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

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
    private authService: AuthService
  ) {
    this.loadCartFromStorage();
    
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.clearCart();
      } else {
        this.loadDraftOrderIdFromStorage();
        this.loadUserCart(user.id || user.email);
      }
    });
  }

  addToCartAsync(giftId: number, quantity: number = 1): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      return throwError(() => new Error('אנא התחבר מחדש כדי להוסיף מוצרים לסל'));
    }

    if (this.currentDraftOrderId) {
      return this.addItemToExistingOrder(this.currentDraftOrderId, giftId, quantity).pipe(
        catchError((err) => {
          if (!this.shouldRecreateDraftOrder(err)) {
            return throwError(() => err);
          }

          this.clearDraftOrderId();
          return this.createDraftOrder(giftId, quantity);
        })
      );
    }

    return this.createDraftOrder(giftId, quantity);
  }

  private createDraftOrder(giftId: number, quantity: number): Observable<any> {

    const orderRequest = {
      TotalAmount: 0.01,
      IsDraft: true,
      OrderItems: [
        {
          GiftId: giftId,
          Quantity: quantity
        }
      ]
    };

    return this.http.post(`${this.apiUrl}/Order/checkout`, orderRequest).pipe(
      tap((response: any) => {
        if (response.orderId) {
          this.setDraftOrderId(response.orderId);
        }
      })
    );
  }

  addItemToExistingOrder(orderId: number, giftId: number, quantity: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Order/${orderId}/add-item`, {
      GiftId: giftId,
      Quantity: quantity
    }, { responseType: 'text' });
  }

  getCart(): OrderItem[] {
    return this.cartSubject.value;
  }

  addToCart(giftId: number, quantity: number = 1, giftData?: Gift): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.giftId === giftId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: any = { giftId, quantity };
      if (giftData) {
        newItem.giftData = giftData;
      }
      cart.push(newItem);
    }
    
    this.updateCart(cart);
  }

  removeFromCart(giftId: number): void {
    const cart = this.getCart().filter(item => item.giftId !== giftId);
    this.updateCart(cart);
  }

  clearCart(): void {
    this.updateCart([]);
    this.clearDraftOrderId();
  }

  private updateCart(cart: OrderItem[]): void {
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

    this.loadDraftOrderIdFromStorage();
    
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

  getUserOrderHistory(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Order/user/history/${userId}`);
  }

  getAllOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Order/all`);
  }

  confirmOrder(userId: number, totalAmount: number): Observable<any> {
    if (this.currentDraftOrderId) {
      return this.confirmOrderById(this.currentDraftOrderId).pipe(
        tap(() => {
          this.clearDraftOrderId();
          this.clearCart();
        })
      );
    }
    
    const cart = this.getCart();
    
    if (cart.length === 0) {
      throw new Error('הסל ריק');
    }
    
    const orderRequest = {
      TotalAmount: totalAmount,
      IsDraft: false,
      OrderItems: cart.map(item => ({
        GiftId: item.giftId,
        Quantity: item.quantity
      }))
    };

    return this.http.post(`${this.apiUrl}/Order/checkout`, orderRequest).pipe(
      tap(() => this.clearCart())
    );
  }

  confirmOrderById(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Order/confirm/${orderId}`, {}, { responseType: 'text' });
  }

  private getDraftOrderStorageKey(): string | null {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return null;
    }

    const userKey = currentUser.id || currentUser.email;
    return `currentDraftOrderId_${userKey}`;
  }

  private loadDraftOrderIdFromStorage(): void {
    const key = this.getDraftOrderStorageKey();
    if (!key) {
      this.currentDraftOrderId = null;
      return;
    }

    const savedOrderId = localStorage.getItem(key);
    if (!savedOrderId) {
      this.currentDraftOrderId = null;
      return;
    }

    const parsed = Number(savedOrderId);
    this.currentDraftOrderId = Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private setDraftOrderId(orderId: number): void {
    this.currentDraftOrderId = orderId;
    const key = this.getDraftOrderStorageKey();
    if (key) {
      localStorage.setItem(key, orderId.toString());
    }
  }

  private clearDraftOrderId(): void {
    const key = this.getDraftOrderStorageKey();
    this.currentDraftOrderId = null;
    if (key) {
      localStorage.removeItem(key);
    }

    localStorage.removeItem('currentDraftOrderId');
  }

  private shouldRecreateDraftOrder(err: any): boolean {
    const status = err?.status;
    const payload = err?.error;
    const message = typeof payload === 'string'
      ? payload.toLowerCase()
      : (payload?.message ?? '').toLowerCase();

    const raffleIndicators = ['הוגרל', 'זוכה', 'winner', 'raffl'];
    if (raffleIndicators.some((token) => message.includes(token))) {
      return false;
    }

    const draftIndicators = ['draft', 'order', 'not found', 'confirm', 'closed', 'expired'];
    return status === 404 || status === 410 || (status === 400 && draftIndicators.some((token) => message.includes(token)));
  }
}
