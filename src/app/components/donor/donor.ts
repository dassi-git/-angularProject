import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/Admin';
import { Donor } from '../../models/donor.model';

@Component({
  selector: 'app-donor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donor.html',
})
export class DonorListComponent implements OnInit {
  private adminService = inject(AdminService);
  private cdr = inject(ChangeDetectorRef);

  donors: Donor[] = [];
  isLoading = false;
  newDonor: Donor = this.getEmptyDonor();
  editingDonor: Donor | null = null;

  ngOnInit() {
    this.loadDonors();
  }

  loadDonors() {
    this.isLoading = true;
    this.adminService.getDonors().subscribe({
      next: (data) => {
        this.donors = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  addDonor() {
    if (!this.newDonor.name || !this.newDonor.email) return;
    
    console.log('Current user:', this.adminService);
    console.log('Token:', localStorage.getItem('auth_token'));
    
    const donorToAdd: any = {
      name: this.newDonor.name.trim(),
      email: this.newDonor.email.trim(),
      address: this.newDonor.address?.trim() || ''
    };
    
    console.log('Sending donor:', donorToAdd);
    
    this.adminService.addDonor(donorToAdd).subscribe({
      next: () => {
        alert('התורם נוסף בהצלחה!');
        this.newDonor = this.getEmptyDonor();
        this.loadDonors();
      },
      error: (err) => {
        console.error('Error adding donor:', err);
        console.error('Error details:', err.error);
        console.error('Validation errors:', err.error?.errors);
        const errorMsg = err.error?.errors ? JSON.stringify(err.error.errors) : 'שגיאה בהוספת התורם';
        alert(errorMsg);
      }
    });
  }

  // מעבר למצב עריכה
  onEdit(donor: Donor) {
    // יצירת עותק כדי לא לשנות את המקור בטבלה בזמן שמקלידים
    this.editingDonor = { ...donor };
  }

  // ביטול עריכה
  cancelEdit() {
    this.editingDonor = null;
  }

  updateDonor() {
    if (this.editingDonor && this.editingDonor.id) {
      const donorToUpdate = {
        id: this.editingDonor.id,
        name: this.editingDonor.name,
        email: this.editingDonor.email,
        address: this.editingDonor.address,
        gifts: []
      };
      this.adminService.updateDonor(donorToUpdate).subscribe({
        next: () => {
          alert('הנתונים עודכנו!');
          this.editingDonor = null;
          this.loadDonors();
        },
        error: (err) => {
          console.error('Error updating donor:', err);
          alert('שגיאה בעדכון התורם');
        }
      });
    }
  }

  // מחיקה
  onDelete(id: number | undefined) {
    if (id && confirm('האם את בטוחה שברצונך למחוק תורם זה?')) {
      this.adminService.deleteDonor(id).subscribe(() => {
        alert('התורם נמחק');
        this.loadDonors();
      });
    }
  }

  // פונקציית עזר לאיפוס אובייקט
  private getEmptyDonor(): Donor {
    return { name: '', email: '', address: '' };
  }
}