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
      name: String(f.name).trim(), 
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
          const errorMsg = err.status === 400 ? err.error : 'שגיאה בעדכון המתנה';
        this.error.set(errorMsg);
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

         let message = 'שגיאה בהוספת המתנה';

    // בדיקה אם השגיאה היא מסוג Conflict (409) או BadRequest (400)
    if (err.status === 409 || err.status === 400) {
      try {
        // מנסים להפוך את הטקסט לאובייקט JSON
        const errorBody = typeof err.error === 'string' ? JSON.parse(err.error) : err.error;
        // לוקחים את שדה ה-message שהראית לי קודם
        message = errorBody.message || message;
      } catch (e) {
        // אם זה לא JSON, פשוט ניקח את הטקסט כמו שהוא
        message = err.error || message;
      }
    }

    // הצגת השגיאה ב-Signal
    this.error.set(message);

    // בונוס: העלמת השגיאה אוטומטית אחרי 5 שניות כדי שהמסך יישאר נקי
    setTimeout(() => {
      this.error.set('');
    }, 5000);
  
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
