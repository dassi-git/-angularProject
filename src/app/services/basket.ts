import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {Ticket } from  '../models/ticket.model'; // המודל של כרטיס בהזמנה

@Injectable({
  providedIn: 'root',
})
export class BasketService {
  private basket: Ticket[] = []; // רשימה של כרטיסים בסל
  private basketSubject: BehaviorSubject<Ticket[]> = new BehaviorSubject<Ticket[]>(this.basket);

  constructor() {}

  // הוספת כרטיס לסל
  addToBasket(ticket: Ticket) {
    const existingTicket = this.basket.find(t => t.giftId === ticket.giftId);
    if (existingTicket) {
      existingTicket.Quantity += ticket.Quantity;
    } else {
      this.basket.push(ticket);
    }
    this.basketSubject.next(this.basket);
  }

  // הסרת כרטיס מהסל
  removeFromBasket(ticket: Ticket) {
    this.basket = this.basket.filter(t => t.giftId!== ticket.giftId);
    this.basketSubject.next(this.basket);
  }

  // קבלת כל הכרטיסים בסל
  getBasket() {
    return this.basketSubject.asObservable();
  }

  // חישוב הסכום הכולל של כל הכרטיסים
  getTotalAmount(): number {
    return this.basket.reduce((total, ticket) => total + (ticket.Gift.ticketPrice* ticket.Quantity), 0);
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
}
