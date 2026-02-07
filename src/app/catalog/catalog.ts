import { Component, OnInit } from '@angular/core';
import { GiftService } from '../services/gift.service';
import { OrderService } from '../services/order.service';
import { Gift } from '../models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-catalog',        // השם שבו תשתמשי ב-HTML (כמו <app-catalog>)
  standalone: true,             // בגרסאות חדשות זה בד"כ true
  imports: [CommonModule, FormsModule], // דברים שהקומפוננטה צריכה
  templateUrl: './catalog.html',  // ודאי שהנתיב לקובץ ה-HTML שלך נכון
  styleUrls: ['./catalog.scss']   // ודאי שהנתיב ל-SCSS נכון
})
export class CatalogComponent implements OnInit {
gifts:any[] = []
categories: any[] = [];
  isManager = false;
  isLoggedIn = false;
  showAddForm = false;
  newGift: any = { name: '', ticketPrice: 0, imageUrl: '', categoryId: null, description: '' };

  constructor(private giftService: GiftService, private orderService: OrderService) {}

  ngOnInit() {
    this.loadGifts();
  }

  loadGifts() {
    this.giftService.getGifts().subscribe(g => this.gifts = g);
  }

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  onAddGift() {
    this.giftService.addGift(this.newGift).subscribe(() => {
      this.loadGifts();
      this.showAddForm = false;
      this.newGift = { name: '', ticketPrice: 0, imageUrl: '', categoryId: null, description: '' };
    });
  }

  onEdit(gift: any) {
    // open edit form or navigate to edit route
  }

  onDelete(id: number) {
    if (!confirm('Are you sure?')) return;
    this.giftService.deleteGift(id).subscribe(() => this.loadGifts());
  }

  addToCart(gift: any) {
    this.orderService.addToCart(gift);
  }
}