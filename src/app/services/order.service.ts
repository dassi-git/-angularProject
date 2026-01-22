import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Order, OrderItem, Gift } from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  private cartSubject = new BehaviorSubject<OrderItem[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartFromStorage();
  }

  // סל קניות (טיוטה)
  getCart(): OrderItem[] {
    return this.cartSubject.value;
  }

  addToCart(giftId: number, quantity: number = 1): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.giftId === giftId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ giftId, quantity });
    }
    
    this.updateCart(cart);
  }

  removeFromCart(giftId: number): void {
    const cart = this.getCart().filter(item => item.giftId !== giftId);
    this.updateCart(cart);
  }

  clearCart(): void {
    this.updateCart([]);
  }

  private updateCart(cart: OrderItem[]): void {
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
      orderItems: cart
    };

    return this.createOrder(order);
  }
}