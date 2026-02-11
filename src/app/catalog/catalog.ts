import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GiftService } from '../services/gift.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
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
  filteredGifts: any[] = [];
  categories: any[] = [];
  donors: any[] = [];

  searchName: string = '';
  searchDonor: string = '';
  searchCategory: string = '';
  minPurchasers: number | null = null;

  isManager = false;
  isLoggedIn = false;

  cartCount = 0;
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
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadGifts();
    this.loadCategories();
    this.loadDonors();

    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isManager = user?.role === 'Manager';
      this.cdr.markForCheck();
    });

    this.orderService.cart$.subscribe(items => {
      this.cartCount = items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      this.cdr.markForCheck();
    });
  }

  loadCategories() {
    this.giftService.getGifts().subscribe(gifts => {
      const uniqueCategories = [...new Set(gifts.map(g => g.category).filter(c => c))];
      this.categories = uniqueCategories;
    });
  }

  loadDonors() {
    this.giftService.getGifts().subscribe(gifts => {
      const uniqueDonors = [...new Set(gifts.map(g => g.donorName).filter(d => d))];
      this.donors = uniqueDonors;
    });
  }

  loadGifts() {
    this.giftService.getGifts(this.searchName, this.searchDonor, this.minPurchasers).subscribe({
      next: (g) => {
        this.gifts = g.map(gift => ({
          ...gift,
          quantity: 1
        }));
        this.filteredGifts = this.gifts;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading gifts:', err);
      }
    });
  }

  applyFilters() {
    this.loadGifts();
  }

  clearFilters() {
    this.searchName = '';
    this.searchDonor = '';
    this.searchCategory = '';
    this.minPurchasers = null;
    this.loadGifts();
  }

  hasWinner(gift: any): boolean {
    return !!gift.winner || !!gift.winnerName || !!gift.winnerId;
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
  }

  onDelete(id: number) {
    if (!confirm('Are you sure?')) return;
    this.giftService.deleteGift(id).subscribe(() => this.loadGifts());
  }

  addToCart(gift: any) {
    if (!this.isLoggedIn) return;

    this.orderService.addToCartAsync(gift.id, gift.quantity || 1)
      .subscribe({
        next: (response) => {
          this.toastService.success(`המתנה "${gift.name}" נוספה לסל!`);
          this.orderService.addToCart(gift.id, gift.quantity || 1, gift);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          this.toastService.error('שגיאה בהוספה לסל');
        }
      });
  }

  openBasket() {
    this.router.navigate(['/cart']);
  }
}
