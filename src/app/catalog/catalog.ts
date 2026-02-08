import { Component, OnInit } from '@angular/core';
import { GiftService } from '../services/gift.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.scss']
})
export class CatalogComponent implements OnInit {

  gifts: any[] = [];
  categories: any[] = [];

  isManager = false;
  isLoggedIn = false;

  cartCount = 0;            // ✅ נדרש ל־HTML
  showAddForm = false;

  newGift: any = {
    name: '',
    ticketPrice: 0,
    imageUrl: '',
    categoryId: null,
    description: ''
  };

  constructor(
    private giftService: GiftService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // טעינת מתנות
    this.loadGifts();

    // בדיקת משתמש מחובר
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isManager = user?.role === 'Manager';
    });

    // מונה פריטים בסל
    this.orderService.cart$.subscribe(items => {
      this.cartCount = items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    });
  }

  loadGifts() {
    this.giftService.getGifts().subscribe(g => {
      this.gifts = g.map(gift => ({
        ...gift,
        quantity: 1   // כמות ברירת מחדל
      }));
    });
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  onAddGift() {
    this.giftService.addGift(this.newGift).subscribe(() => {
      this.loadGifts();
      this.showAddForm = false;
      this.newGift = {
        name: '',
        ticketPrice: 0,
        imageUrl: '',
        categoryId: null,
        description: ''
      };
    });
  }

  onEdit(gift: any) {
    // future: edit route
  }

  onDelete(id: number) {
    if (!confirm('Are you sure?')) return;
    this.giftService.deleteGift(id).subscribe(() => this.loadGifts());
  }

  // ✅ הוספה לסל – רק אם מחובר
  addToCart(gift: any) {
    if (!this.isLoggedIn) return;

    this.orderService.addToCartAsync(gift.id, gift.quantity || 1)
      .subscribe();
  }

  // ✅ נדרש ל־HTML
  openBasket() {
    this.router.navigate(['/basket']);
  }
}
