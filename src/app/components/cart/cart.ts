import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, GiftService, AuthService } from '../../services';
import { Gift, OrderItem } from '../../models';
import { Subscription, timeout } from 'rxjs';

interface CartItemWithGift {
  orderItem: OrderItem;
  gift: Gift;
  total: number;
}

/**
 * רכיב סל קניות
 * מציג את המתנות בסל ומאפשר ניהול
 */
@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit, OnDestroy {
  cartItems: CartItemWithGift[] = [];
  totalAmount = 0;
  isLoading = false;
  private cartSubscription?: Subscription;

  constructor(
    private orderService: OrderService,
    private giftService: GiftService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // טעינה ראשונית בלבד
    this.loadCartItems();
  }

  ngOnDestroy(): void {
    // ביטול מנוי למניעת דליפות זיכרון
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  /**
   * טוען את פריטי הסל מהשרת
   */
  loadCartItems(): void {
    console.log('טוען סל - גרסה פשוטה');
    
    const cart = this.orderService.getCart();
    console.log('סל מה-localStorage:', cart);
    
    // אם אין פריטים בסל
    if (cart.length === 0) {
      this.cartItems = [];
      this.totalAmount = 0;
      this.isLoading = false;
      console.log('סל ריק');
      return;
    }

    // יצירת פריטים עם נתונים אמיתיים אם קיימים
    this.cartItems = cart.map(orderItem => {
      // אם יש נתוני מתנה שמורים, השתמש בהם
      const gift = (orderItem as any).giftData || {
        id: orderItem.giftId,
        name: `מתנה #${orderItem.giftId}`,
        description: 'תיאור זמני',
        ticketPrice: 50,
        category: 'כללי',
        donorName: 'תורם אנונימי'
      };
      
      return {
        orderItem,
        gift,
        total: gift.ticketPrice * orderItem.quantity
      };
    });
    
    this.calculateTotal();
    this.isLoading = false;
    console.log('סל נטען בהצלחה:', this.cartItems);
  }

  /**
   * מסיר פריט מהסל עם אישור
   */
  removeFromCart(giftId: number): void {
    // אישור מחיקה
    const giftName = this.cartItems.find(item => item.gift.id === giftId)?.gift.name || 'מתנה';
    const confirmed = confirm(`האם אתה בטוח שברצונך להסיר את "${giftName}" מהסל?`);
    
    if (confirmed) {
      this.orderService.removeFromCart(giftId);
      this.loadCartItems();
    }
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
