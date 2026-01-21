import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Gift {
  number: number;
  name: string;
  donor: string;
  ticketCost: number;
}

@Component({
  selector: 'app-gift-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gift-list.html',
  styleUrls: ['./gift-list.scss'],
})
export class GiftList {
  donors = ['אבי', 'דנה', 'רותי', 'יוסי'];
  gifts = signal<Gift[]>([]);

  // form model
  editing = signal(false);
  form = signal<Partial<Gift>>({ ticketCost: 10 });
  error = signal('');

  private findByNumber(n: number) {
    return this.gifts().find(g => g.number === n);
  }

  private findByName(name: string) {
    return this.gifts().find(g => g.name === name);
  }

  startAdd() {
    this.error.set('');
    this.editing.set(true);
    this.form.set({ ticketCost: 10 });
  }

  startEdit(g: Gift) {
    this.error.set('');
    this.editing.set(true);
    this.form.set({ ...g });
  }

  save() {
    this.error.set('');
    const f = this.form();
    if (!f.number || !f.name || !f.donor || (f.ticketCost === undefined || f.ticketCost === null)) {
      this.error.set('כל השדות הינם חובה.');
      return;
    }
    const num = Number(f.number);
    const cost = Number(f.ticketCost);

    // when editing, allow same number/name for the same gift
    const existingByNumber = this.gifts().find(g => g.number === num && g.name !== f.name);
    if (existingByNumber) {
      this.error.set('מספר המתנה כבר קיים במערכת.');
      return;
    }
    const existingByName = this.gifts().find(g => g.name === f.name && g.number !== num);
    if (existingByName) {
      this.error.set('שם המתנה כבר קיים במערכת.');
      return;
    }

    const gifts = [...this.gifts()];
    const idx = gifts.findIndex(g => g.number === num || g.name === f.name);
    const gift: Gift = { number: num, name: String(f.name), donor: String(f.donor), ticketCost: cost };

    if (idx >= 0) {
      // update existing
      gifts[idx] = gift;
    } else {
      gifts.push(gift);
    }

    this.gifts.set(gifts);
    this.cancel();
  }

  delete(g: Gift) {
    this.gifts.set(this.gifts().filter(x => x !== g));
    // if currently editing this gift, cancel
    const f = this.form();
    if (f.number === g.number && f.name === g.name) this.cancel();
  }

  cancel() {
    this.editing.set(false);
    this.form.set({ ticketCost: 10 });
    this.error.set('');
  }
}
