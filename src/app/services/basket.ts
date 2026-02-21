import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Ticket } from  '../models/ticket.model'; // המודל של כרטיס בהזמנה

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private basket: Ticket[] = []; // רשימה של כרטיסים בסל
  private readonly basketSubject = new BehaviorSubject<Ticket[]>([]);
  readonly basket$ = this.basketSubject.asObservable();
  private readonly basketSignal = signal<Ticket[]>([]);
  readonly basketItems = computed(() => this.basketSignal());
  readonly totalAmount = computed(() =>
    this.basketSignal().reduce((total, ticket) => total + (ticket.Gift.ticketPrice * ticket.Quantity), 0)
  );

  constructor() {}

  // הוספת כרטיס לסל
  addToBasket(ticket: Ticket): void {
    const existingTicket = this.basket.find(t => t.giftId === ticket.giftId);
    if (existingTicket) {
      this.basket = this.basket.map(item =>
        item.giftId === ticket.giftId
          ? { ...item, Quantity: item.Quantity + ticket.Quantity }
          : item
      );
    } else {
      this.basket = [...this.basket, { ...ticket }];
    }
    this.setBasketState(this.basket);
  }

  // הסרת כרטיס מהסל
  removeFromBasket(ticket: Ticket): void {
    this.basket = this.basket.filter(t => t.giftId!== ticket.giftId);
    this.setBasketState(this.basket);
  }

  // קבלת כל הכרטיסים בסל
  getBasket() {
    return this.basket$;
  }

  // חישוב הסכום הכולל של כל הכרטיסים
  getTotalAmount(): number {
    return this.totalAmount();
  }

  // ביצוע רכישה
  checkout(userId: number) {
    // אפשר לשלוח את הבקשה לשרת כאן (לאחר שהמשתמש ביצע login)
    return {
      UserId: userId,
      OrderItems: this.basket,
      TotalAmount: this.getTotalAmount(),
      OrderDate: new Date(),
    };
  }

  private setBasketState(nextBasket: Ticket[]): void {
    const normalized = [...nextBasket];
    this.basketSignal.set(normalized);
    this.basketSubject.next(normalized);
  }
}
