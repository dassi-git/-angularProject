import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiftService } from '../../services';
import { AdminService } from '../../services/Admin';
import { Gift } from '../../models';

@Component({
  selector: 'app-gift-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gift-management.component.html',
  styleUrls: ['./gift-management.component.css']
})
export class GiftManagementComponent {
  donors = signal<any[]>([]);
  gifts = signal<Gift[]>([]);
  editing = signal(false);
  form = signal<Partial<Gift>>({ ticketPrice: 10 });
  error = signal('');

  constructor(private giftService: GiftService, private adminService: AdminService) {
    this.loadGifts();
    this.loadDonors();
  }

  private loadDonors() {
    this.adminService.getDonors().subscribe({
      next: (donors) => this.donors.set(donors || []),
      error: (error) => console.error('Error loading donors:', error)
    });
  }

  private loadGifts() {
    this.giftService.getGifts().subscribe({
      next: (gifts) => this.gifts.set(gifts || []),
      error: (error) => {
        console.error('Error loading gifts:', error);
        this.error.set('שגיאה בטעינת המתנות');
      }
    });
  }

  startAdd() {
    this.error.set('');
    this.editing.set(true);
    this.form.set({ ticketPrice: 10 });
  }

  startEdit(g: Gift) {
    this.error.set('');
    this.editing.set(true);
    this.form.set({ ...g });
  }

  save() {
    this.error.set('');
    const f = this.form();
    
    if (!f.name || !f.donorName || (f.ticketPrice === undefined || f.ticketPrice === null)) {
      this.error.set('כל השדות הינם חובה.');
      return;
    }

    const giftData: any = { 
      name: String(f.name), 
      donorName: String(f.donorName), 
      ticketPrice: Number(f.ticketPrice),
      category: f.category || '',
      description: f.description || ''
    };

    if (f.id) {
      giftData.id = f.id;
      this.giftService.updateGift(giftData).subscribe({
        next: () => {
          this.loadGifts();
          this.cancel();
        },
        error: (err) => {
          console.error('Error updating gift:', err);
          this.error.set('שגיאה בעדכון המתנה');
        }
      });
    } else {
      this.giftService.addGift(giftData).subscribe({
        next: () => {
          this.loadGifts();
          this.cancel();
        },
        error: (err) => {
          console.error('Error adding gift:', err);
          this.error.set('שגיאה בהוספת המתנה');
        }
      });
    }
  }

  delete(g: Gift) {
    if (!g.id || !confirm('האם למחוק את המתנה?')) return;
    
    this.giftService.deleteGift(g.id).subscribe({
      next: () => {
        this.loadGifts();
        this.cancel();
      },
      error: (err) => this.error.set('שגיאה במחיקת המתנה')
    });
  }

  cancel() {
    this.editing.set(false);
    this.form.set({ ticketPrice: 10 });
    this.error.set('');
  }
}
