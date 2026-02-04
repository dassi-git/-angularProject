import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/Admin'; // השתמשי בסרביס המאוחד שלך
import { Donor } from '../../models/donor.model';

@Component({
  selector: 'app-donor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donor.html',
})
export class DonorListComponent implements OnInit {
  private adminService = inject(AdminService);

  // משתנים לניהול המדינה (State)
  donors: Donor[] = [];
  isLoading = false;

  // אובייקט זמני להוספה
  newDonor: Donor = this.getEmptyDonor();

  // אובייקט זמני לעריכה (כאן הפתרון לשגיאה הקודמת!)
  editingDonor: Donor | null = null;

  ngOnInit() {
    this.loadDonors();
  }

  // טעינת רשימה
  loadDonors() {
    this.isLoading = true;
    this.adminService.getDonors().subscribe({
      next: (data) => {
        this.donors = data;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // הוספת תורם
  addDonor() {
    if (!this.newDonor.name || !this.newDonor.email) return;
    
    this.adminService.addDonor(this.newDonor).subscribe(() => {
      alert('התורם נוסף בהצלחה!');
      this.newDonor = this.getEmptyDonor();
      this.loadDonors(); // רענון הרשימה מהשרת
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

  // עדכון תורם
  updateDonor() {
    if (this.editingDonor && this.editingDonor.id) {
      this.adminService.updateDonor(this.editingDonor).subscribe(() => {
        alert('הנתונים עודכנו!');
        this.editingDonor = null;
        this.loadDonors();
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
    return { name: '', email: '', address: '', IsDeleted: false };
  }
}