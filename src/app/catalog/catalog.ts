import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { GiftService } from '../services/gift.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Gift } from '../models/gift.model';
import { Subject, takeUntil } from 'rxjs';
import { PositiveNumberDirective } from '../shared/directives/positive-number.directive';

@Component({
  selector: 'app-catalog',
  imports: [CommonModule, ReactiveFormsModule, PositiveNumberDirective],
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

  readonly canBuyTickets = computed(() => this.isLoggedIn());

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

  readonly hasActiveFilters = computed(() => {
    return !!this.appliedSearchName()
      || !!this.appliedSearchDonor()
      || !!this.appliedSearchCategory()
      || this.appliedMinPurchasers() !== null;
  });

  readonly filterForm: FormGroup = this.fb.group({
    name: [''],
    donor: [''],
    category: [''],
    minPurchasers: [null]
  });

  // Reactive form for adding gifts
  readonly addGiftForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    ticketPrice: [0, [Validators.required, Validators.min(1)]],
    imageUrl: [''],
    categoryId: [null],
    description: ['']
  });

  constructor() {}

  ngOnInit(): void {
    // Load initial data
    this.appliedSearchName.set('');
    this.appliedSearchDonor.set('');
    this.appliedSearchCategory.set('');
    this.appliedMinPurchasers.set(null);
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
      this.appliedSearchName() || undefined,
      this.appliedSearchDonor() || undefined,
      this.appliedMinPurchasers() || undefined
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (gifts) => {
          this.gifts.set(gifts);
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
    const rawFilters = this.filterForm.getRawValue();
    const normalizedName = (rawFilters.name ?? '').trim();
    const normalizedDonor = rawFilters.donor ?? '';
    const normalizedCategory = rawFilters.category ?? '';
    const parsedMin = rawFilters.minPurchasers !== null && rawFilters.minPurchasers !== ''
      ? Number(rawFilters.minPurchasers)
      : null;

    this.appliedSearchName.set(normalizedName);
    this.appliedSearchDonor.set(normalizedDonor);
    this.appliedSearchCategory.set(normalizedCategory);
    this.appliedMinPurchasers.set(Number.isFinite(parsedMin) && parsedMin !== null && parsedMin > 0 ? parsedMin : null);

    this.loadGifts();
  }

  clearFilters(): void {
    this.filterForm.reset({
      name: '',
      donor: '',
      category: '',
      minPurchasers: null
    });

    this.appliedSearchName.set('');
    this.appliedSearchDonor.set('');
    this.appliedSearchCategory.set('');
    this.appliedMinPurchasers.set(null);
    this.loadGifts();
  }

  hasWinner(gift: Gift): boolean {
    const candidate = gift as Gift & {
      winner?: unknown;
      winnerName?: string;
      winnerId?: number;
    };
    return !!candidate.winner || !!candidate.winnerName || !!candidate.winnerId;
  }

  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    if (this.showAddForm()) {
      this.addGiftForm.reset({
        name: '',
        ticketPrice: 0,
        imageUrl: '',
        categoryId: null,
        description: ''
      });
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
    if (!this.canBuyTickets()) {
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
          this.openBasket();
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          const errorMsg = this.resolveAddToCartErrorMessage(err);
          this.errorMessage.set(errorMsg);

        }
      });
  }

  private resolveAddToCartErrorMessage(err: unknown): string {
    const errorPayload = (err as { error?: unknown })?.error;

    const rawMessage = typeof errorPayload === 'string'
      ? errorPayload
      : (errorPayload as { message?: string })?.message;

    if (!rawMessage) {
      return 'שגיאה בהוספה לסל. אנא נסה שוב.';
    }

    const normalized = rawMessage.toLowerCase();
    const raffleIndicators = ['הוגרל', 'זוכה', 'winner', 'raffl'];
    const isRaffleError = raffleIndicators.some(token => normalized.includes(token));

    if (isRaffleError) {
      return 'לא ניתן להוסיף לסל: המתנה כבר הוגרלה.';
    }

    return rawMessage;
  }

  getQuantity(giftId: number): number {
    return this.quantities()[giftId] || 1;
  }

  setQuantity(giftId: number, quantity: number): void {
    const normalizedQuantity = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    this.quantities.update(q => ({ ...q, [giftId]: normalizedQuantity }));
  }

  onQuantityInput(giftId: number, rawValue: string): void {
    const parsedValue = Number(rawValue);
    this.setQuantity(giftId, parsedValue);
  }

  openBasket(): void {
    this.router.navigate(['/cart']);
  }
}
