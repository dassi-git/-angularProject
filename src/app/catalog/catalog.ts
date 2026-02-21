import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { GiftService } from '../services/gift.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Gift } from '../models/gift.model';
import { Subject, takeUntil, combineLatest } from 'rxjs';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogComponent implements OnInit, OnDestroy {

  private readonly giftService = inject(GiftService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  private readonly destroy$ = new Subject<void>();

  // Signals for state management
  readonly gifts = signal<Gift[]>([]);
  readonly categories = signal<string[]>([]);
  readonly donors = signal<string[]>([]);

  // Filter signals
  readonly searchName = signal('');
  readonly searchDonor = signal('');
  readonly searchCategory = signal('');
  readonly minPurchasers = signal<number | null>(null);

  // Applied filter signals (for server-side filtering)
  readonly appliedSearchName = signal('');
  readonly appliedSearchDonor = signal('');
  readonly appliedSearchCategory = signal('');
  readonly appliedMinPurchasers = signal<number | null>(null);

  // UI state signals
  readonly isManager = signal(false);
  readonly isLoggedIn = signal(false);
  readonly cartCount = signal(0);
  readonly showAddForm = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Quantity tracking for cart additions
  readonly quantities = signal<Record<number, number>>({});

  // Computed signals for derived state
  readonly filteredGifts = computed(() => {
    let filtered = this.gifts();

    // Client-side filtering for category (only after search button is clicked)
    const categoryFilter = this.appliedSearchCategory();
    if (categoryFilter) {
      filtered = filtered.filter(gift => gift.category === categoryFilter);
    }

    return filtered;
  });

  // Reactive form for adding gifts
  readonly addGiftForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    ticketPrice: [0, [Validators.required, Validators.min(1)]],
    imageUrl: [''],
    categoryId: [null],
    description: ['']
  });

  constructor() {
    // Remove automatic effect - search will be manual
  }

  // Getters and setters for ngModel binding with signals
  get searchNameValue(): string {
    return this.searchName();
  }

  set searchNameValue(value: string) {
    this.searchName.set(value);
  }

  get searchDonorValue(): string {
    return this.searchDonor();
  }

  set searchDonorValue(value: string) {
    this.searchDonor.set(value);
  }

  get searchCategoryValue(): string {
    return this.searchCategory();
  }

  set searchCategoryValue(value: string) {
    this.searchCategory.set(value);
  }

  get minPurchasersValue(): number | null {
    return this.minPurchasers();
  }

  set minPurchasersValue(value: number | null) {
    this.minPurchasers.set(value);
  }

  ngOnInit(): void {
    // Load initial data
    this.loadGifts(); // Load all gifts initially
    this.loadCategories();
    this.loadDonors();

    // Subscribe to auth state
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn.set(!!user);
        this.isManager.set(user?.role === 'Manager');
      });

    // Subscribe to cart changes
    this.orderService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.cartCount.set(items.reduce((sum, item) => sum + item.quantity, 0));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.giftService.getGifts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(gifts => {
        const uniqueCategories = [...new Set(gifts.map(g => g.category).filter(c => c))];
        this.categories.set(uniqueCategories);
      });
  }

  private loadDonors(): void {
    this.giftService.getGifts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(gifts => {
        const uniqueDonors = [...new Set(gifts.map(g => g.donorName).filter(d => d))];
        this.donors.set(uniqueDonors);
      });
  }

  private loadGifts(): void {
    this.errorMessage.set(null); // Clear previous errors
    this.giftService.getGifts(
      this.searchName() || undefined,
      this.searchDonor() || undefined,
      this.minPurchasers() || undefined
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (gifts) => {
          this.gifts.set(gifts.map(gift => ({
            ...gift,
            quantity: 1
          })));
          this.errorMessage.set(null); // Clear error on success
        },
        error: (err) => {
          console.error('Error loading gifts:', err);
          this.errorMessage.set('שגיאה בטעינת המתנות. אנא נסה שוב.');
          this.toastService.error('שגיאה בטעינת המתנות');
        }
      });
  }

  applyFilters(): void {
    // Apply all filters when search button is clicked
    this.appliedSearchName.set(this.searchName());
    this.appliedSearchDonor.set(this.searchDonor());
    this.appliedSearchCategory.set(this.searchCategory());
    this.appliedMinPurchasers.set(this.minPurchasers());
    this.loadGifts();
  }

  clearFilters(): void {
    // Clear both input and applied filter signals
    this.searchName.set('');
    this.searchDonor.set('');
    this.searchCategory.set('');
    this.minPurchasers.set(null);
    this.appliedSearchName.set('');
    this.appliedSearchDonor.set('');
    this.appliedSearchCategory.set('');
    this.appliedMinPurchasers.set(null);
    this.loadGifts();
  }

  hasWinner(gift: Gift): boolean {
    return !!(gift as any).winner || !!(gift as any).winnerName || !!(gift as any).winnerId;
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    if (this.showAddForm()) {
      this.addGiftForm.reset();
    }
  }

  onAddGift(): void {
    if (this.addGiftForm.invalid) {
      this.toastService.error('אנא מלא את כל השדות הנדרשים');
      this.errorMessage.set('אנא מלא את כל השדות הנדרשים');
      return;
    }

    const newGift = this.addGiftForm.value;
    this.giftService.addGift(newGift)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('המתנה נוספה בהצלחה!');
          this.errorMessage.set(null);
          this.toggleAddForm();
          this.loadGifts();
        },
        error: (err) => {
          console.error('Error adding gift:', err);
          const errorMsg = err?.error?.message || 'שגיאה בהוספת המתנה';
          this.errorMessage.set(errorMsg);
        }
      });
  }

  onEdit(gift: Gift): void {
    // TODO: Implement edit functionality
  }

  onDelete(id: number): void {
    if (!confirm('האם אתה בטוח שברצונך למחוק את המתנה?')) return;

    this.giftService.deleteGift(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('המתנה נמחקה בהצלחה!');
          this.errorMessage.set(null);
          this.loadGifts();
        },
        error: (err) => {
          console.error('Error deleting gift:', err);
          const errorMsg = err?.error?.message || 'שגיאה במחיקת המתנה';
          this.errorMessage.set(errorMsg);
        }
      });
  }

  addToCart(gift: Gift): void {
    if (!this.isLoggedIn()) {
      this.toastService.error('יש להתחבר כדי להוסיף מוצרים לסל');
      return;
    }

    const quantity = this.getQuantity(gift.id);

    this.orderService.addToCartAsync(gift.id, quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success(`המתנה "${gift.name}" נוספה לסל!`);
          this.orderService.addToCart(gift.id, quantity, gift);
          this.errorMessage.set(null); // Clear any previous errors
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          const errorMsg = err?.error?.message || 'שגיאה בהוספה לסל - ייתכן שהמתנה כבר הוגרלה';
          this.errorMessage.set(errorMsg);

        }
      });
  }

  getQuantity(giftId: number): number {
    return this.quantities()[giftId] || 1;
  }

  setQuantity(giftId: number, quantity: number): void {
    this.quantities.update(q => ({ ...q, [giftId]: quantity }));
  }

  openBasket(): void {
    this.router.navigate(['/cart']);
  }
}
