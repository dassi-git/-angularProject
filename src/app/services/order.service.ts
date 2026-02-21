import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Order, OrderItem, Gift } from '../models';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;
  private readonly cartSubject = new BehaviorSubject<OrderItem[]>([]);
  readonly cart$ = this.cartSubject.asObservable();
  private readonly cartSignal = signal<OrderItem[]>([]);
  readonly cart = computed(() => this.cartSignal());
  readonly cartCount = computed(() => this.cartSignal().reduce((sum, item) => sum + item.quantity, 0));

  private currentDraftOrderId: number | null = null;

  constructor() {
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

  addToCartAsync(giftId: number, quantity: number = 1): Observable<unknown> {
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

  private createDraftOrder(giftId: number, quantity: number): Observable<unknown> {

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
      tap((response: { orderId?: number } | null) => {
        if (response?.orderId) {
          this.setDraftOrderId(response.orderId);
        }
      })
    );
  }

  addItemToExistingOrder(orderId: number, giftId: number, quantity: number): Observable<string> {
    return this.http.post(`${this.apiUrl}/Order/${orderId}/add-item`, {
      GiftId: giftId,
      Quantity: quantity
    }, { responseType: 'text' });
  }

  getCart(): OrderItem[] {
    return this.cartSignal();
  }

  addToCart(giftId: number, quantity: number = 1, giftData?: Gift): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.giftId === giftId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const newItem: OrderItem = { giftId, quantity };
      if (giftData) {
        (newItem as OrderItem & { giftData?: Gift }).giftData = giftData;
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
    this.setCartState(cart);
    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      const userId = currentUser.id || currentUser.email;
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cart));
    }
  }

  private loadCartFromStorage(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.setCartState([]);
      return;
    }

    this.loadDraftOrderIdFromStorage();
    
    const userId = currentUser.id || currentUser.email;
    const saved = localStorage.getItem(`cart_${userId}`);
    if (saved) {
      this.setCartState(this.parseStoredCart(saved));
    } else {
      this.setCartState([]);
    }
  }

  private loadUserCart(userId: string | number): void {
    const saved = localStorage.getItem(`cart_${userId}`);
    if (saved) {
      this.setCartState(this.parseStoredCart(saved));
    } else {
      this.setCartState([]);
    }
  }

  // הזמנות
  createOrder(order: Order): Observable<unknown> {
    return this.http.post<unknown>(`${this.apiUrl}/Order`, order);
  }

  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/Order/user/${userId}`);
  }

  getUserOrderHistory(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/Order/user/history/${userId}`);
  }

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/Order/all`);
  }

  confirmOrder(_userId: number, totalAmount: number): Observable<unknown> {
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
      return throwError(() => new Error('הסל ריק'));
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

  private shouldRecreateDraftOrder(err: { status?: number; error?: unknown }): boolean {
    const status = err?.status;
    const payload = err?.error;
    const payloadMessage = payload && typeof payload === 'object' && 'message' in payload
      ? String((payload as { message?: unknown }).message ?? '')
      : '';
    const message = typeof payload === 'string'
      ? payload.toLowerCase()
      : payloadMessage.toLowerCase();

    const raffleIndicators = ['הוגרל', 'זוכה', 'winner', 'raffl'];
    if (raffleIndicators.some((token) => message.includes(token))) {
      return false;
    }

    const draftIndicators = ['draft', 'order', 'not found', 'confirm', 'closed', 'expired'];
    return status === 404 || status === 410 || (status === 400 && draftIndicators.some((token) => message.includes(token)));
  }

  private parseStoredCart(rawCart: string): OrderItem[] {
    try {
      const parsed = JSON.parse(rawCart);
      return Array.isArray(parsed) ? parsed as OrderItem[] : [];
    } catch {
      return [];
    }
  }

  private setCartState(cart: OrderItem[]): void {
    const normalized = [...cart];
    this.cartSignal.set(normalized);
    this.cartSubject.next(normalized);
  }
}
