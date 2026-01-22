import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DonorService } from '../../services/donor.service';
import { RaffleService } from '../../services/raffle.service';
import { GiftService, AuthService } from '../../services';
import { Donor, Gift, Winner } from '../../models';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  donors: Donor[] = [];
  gifts: Gift[] = [];
  winners: Winner[] = [];
  revenueReport: any = {};
  
  newDonor: Partial<Donor> = { name: '', email: '', address: '' };
  editingDonor: Donor | null = null;
  
  isLoading = false;
  activeTab = 'donors';

  constructor(
    private donorService: DonorService,
    private raffleService: RaffleService,
    private giftService: GiftService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      if (!this.authService.isAdmin()) {
        alert('אין לך הרשאה לגשת לעמוד זה');
        this.router.navigate(['/cart']);
        return;
      }
      this.loadData();
    }, 100);
  }

  loadData(): void {
    this.loadDonors();
    this.loadGifts();
    this.loadWinners();
    this.loadRevenueReport();
  }

  loadDonors(): void {
    this.donorService.getDonors().subscribe(donors => this.donors = donors);
  }

  loadGifts(): void {
    this.giftService.getGifts().subscribe(gifts => this.gifts = gifts);
  }

  loadWinners(): void {
    this.raffleService.getWinners().subscribe(winners => this.winners = winners);
  }

  loadRevenueReport(): void {
    this.raffleService.getRevenueReport().subscribe(report => this.revenueReport = report);
  }

  addDonor(): void {
    if (!this.newDonor.name || !this.newDonor.email) return;
    
    this.donorService.addDonor(this.newDonor as Omit<Donor, 'id' | 'gifts'>).subscribe({
      next: () => {
        this.loadDonors();
        this.newDonor = { name: '', email: '', address: '' };
      },
      error: () => alert('שגיאה בהוספת תורם')
    });
  }

  editDonor(donor: Donor): void {
    this.editingDonor = { ...donor };
  }

  updateDonor(): void {
    if (!this.editingDonor) return;
    
    this.donorService.updateDonor(this.editingDonor).subscribe({
      next: () => {
        this.loadDonors();
        this.editingDonor = null;
      },
      error: () => alert('שגיאה בעדכון תורם')
    });
  }

  deleteDonor(id: number): void {
    if (!confirm('האם אתה בטוח שברצונך למחוק את התורם?')) return;
    
    this.donorService.deleteDonor(id).subscribe({
      next: () => this.loadDonors(),
      error: () => alert('שגיאה במחיקת תורם')
    });
  }

  conductRaffle(giftId: number): void {
    if (!confirm('האם אתה בטוח שברצונך לבצע הגרלה?')) return;
    
    this.isLoading = true;
    this.raffleService.conductRaffle(giftId).subscribe({
      next: (winner) => {
        alert(`הזוכה הוא: ${winner.winnerName}`);
        this.loadWinners();
        this.loadGifts();
        this.isLoading = false;
      },
      error: () => {
        alert('שגיאה בביצוע ההגרלה');
        this.isLoading = false;
      }
    });
  }

  cancelEdit(): void {
    this.editingDonor = null;
  }
}
