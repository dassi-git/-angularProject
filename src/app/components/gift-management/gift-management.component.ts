import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiftService } from '../../services';
import { Gift } from '../../models';

@Component({
  selector: 'app-gift-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gift-management.component.html',
  styleUrls: ['./gift-management.component.css']
})
export class GiftManagementComponent {
  donors = ['אבי', 'דנה', 'רותי', 'יוסי'];
  gifts = signal<Gift[]>([]);
  editing = signal(false);
  form = signal<Partial<Gift>>({ ticketPrice: 10 });
  error = signal('');

  constructor(private giftService: GiftService) {
    this.loadGifts();
  }

  private loadGifts() {
    this.giftService.getGifts().subscribe({
      next: (gifts) => this.gifts.set(gifts || []),
      error: (error) => console.error('Error loading gifts:', error)
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
    
    if (!f.id || !f.name || !f.donorName || (f.ticketPrice === undefined || f.ticketPrice === null)) {
      this.error.set('כל השדות הינם חובה.');
      return;
    }

    const gifts = [...this.gifts()];
    const idx = gifts.findIndex(g => g.id === f.id || g.name === f.name);
    const gift: Gift = { 
      id: Number(f.id), 
      name: String(f.name), 
      donorName: String(f.donorName), 
      ticketPrice: Number(f.ticketPrice),
      category: f.category || '',
      description: f.description || ''
    };

    if (idx >= 0) {
      gifts[idx] = gift;
    } else {
      gifts.push(gift);
    }

    this.gifts.set(gifts);
    this.cancel();
  }

  delete(g: Gift) {
    this.gifts.set(this.gifts().filter(x => x !== g));
    const f = this.form();
    if (f.id === g.id && f.name === g.name) this.cancel();
  }

  cancel() {
    this.editing.set(false);
    this.form.set({ ticketPrice: 10 });
    this.error.set('');
  }
}