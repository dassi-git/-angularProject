import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/Admin';
import { GiftService } from '../../services/gift.service';
import { Gift } from '../../models/gift.model';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-raffle-manage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './raffle-manage.html',
  styleUrl: './raffle-manage.scss'
})
export class RaffleManage implements OnInit {
  private adminService = inject(AdminService);
  private giftService = inject(GiftService);
  private cdr = inject(ChangeDetectorRef);
  private toastService = inject(ToastService);

  gifts: Gift[] = [];
  isLoading = false;
  showConfirmDialog = false;
  selectedGiftId: number | null = null;

  ngOnInit(): void {
    this.loadGifts();
  }

  loadGifts(): void {
    this.isLoading = true;
    this.giftService.getGifts().subscribe({
      next: (data) => {
        this.gifts = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  conductRaffle(giftId: number): void {
    this.selectedGiftId = giftId;
    this.showConfirmDialog = true;
  }

  confirmRaffle(): void {
    if (!this.selectedGiftId) return;
    
    this.showConfirmDialog = false;
    this.isLoading = true;

    this.adminService.conductRaffle(this.selectedGiftId).subscribe({
      next: (result) => {
        if (result.winner) {
          const winnerName = result.winner.winnerName || result.winner.winnerEmail || `משתמש #${result.winner.userId}`;
          const giftName = result.winner.giftName || `מתנה #${result.winner.giftId}`;
          this.toastService.success(`מזל טוב! הזוכה במתנה "${giftName}" הוא: ${winnerName}`, 5000);
        } else {
          this.toastService.warning('אין קונים למתנה זו. לא ניתן לבצע הגרלה.');
        }
        this.isLoading = false;
        this.loadGifts();
        this.cdr.detectChanges();
      },
      error: (err) => {
        const errorMsg = err.error?.error || err.error?.message || 'קרתה שגיאה בביצוע ההגרלה';
        this.toastService.error(errorMsg);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancelRaffle(): void {
    this.showConfirmDialog = false;
    this.selectedGiftId = null;
  }
}
