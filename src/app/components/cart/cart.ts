import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, GiftService, AuthService } from '../../services';
import { Gift, OrderItem } from '../../models';
import { forkJoin } from 'rxjs';

interface CartItemWithGift {
  orderItem: OrderItem;
  gift: Gift;
  total: number;
}

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartItems: CartItemWithGift[] = [];
  totalAmount = 0;
  isLoading = false;

  constructor(
    private orderService: OrderService,
    private giftService: GiftService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems(): void {
    const cart = this.orderService.getCart();
    if (cart.length === 0) {
      this.cartItems = [];
      this.totalAmount = 0;
      return;
    }

    this.isLoading = true;
    const giftRequests = cart.map(item => 
      this.giftService.getGiftById(item.giftId)
    );

    forkJoin(giftRequests).subscribe({
      next: (gifts) => {
        this.cartItems = cart.map((orderItem, index) => {
          const gift = gifts[index];
          return {
            orderItem,
            gift,
            total: gift.ticketPrice * orderItem.quantity
          };
        });
        this.calculateTotal();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  removeFromCart(giftId: number): void {
    this.orderService.removeFromCart(giftId);
    this.loadCartItems();
  }

  updateQuantity(giftId: number, value: any): void {
    const quantity = +value;
    if (quantity <= 0) {
      this.removeFromCart(giftId);
      return;
    }
    
    this.orderService.removeFromCart(giftId);
    this.orderService.addToCart(giftId, quantity);
    this.loadCartItems();
  }

  confirmPurchase(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.isLoading = true;
    const userId = 1;
    
    this.orderService.confirmOrder(userId).subscribe({
      next: () => {
        this.orderService.clearCart();
        this.cartItems = [];
        this.totalAmount = 0;
        this.isLoading = false;
        alert('הרכישה אושרה בהצלחה!');
      },
      error: () => {
        this.isLoading = false;
        alert('שגיאה באישור הרכישה');
      }
    });
  }

  private calculateTotal(): void {
    this.totalAmount = this.cartItems.reduce((sum, item) => sum + item.total, 0);
  }

  getTotalTickets(): number {
    return this.cartItems.reduce((sum, item) => sum + item.orderItem.quantity, 0);
  }
}
