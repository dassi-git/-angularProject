import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { DonorService } from '../../services/donor.service';
import { Donor } from '../../models/donor.model';

@Component({
  selector: 'app-donor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './donor.html',
})
export class DonorListComponent {
  // הזרקת השירות (Dependency Injection) בשיטה המודרנית
  private donorService = inject(DonorService);

  // הפיכת ה-Observable של התורמים לסיגנל
  // כך ה-HTML יתעדכן אוטומטית כשהנתונים יגיעו
  donors = toSignal(this.donorService.getDonors(), { initialValue: [] });

  // אובייקט זמני ליצירת תורם חדש
  newDonor: Omit<Donor, 'id' | 'gifts'> = {
    name: '',
    email: '',
    address: '',
    IsDeleted: false
  };

  // פונקציה להוספת תורם
  saveDonor() {
    if (this.newDonor.name && this.newDonor.email) {
      this.donorService.addDonor(this.newDonor).subscribe({
        next: (savedDonor) => {
          alert('התורם נוסף בהצלחה!');
          // איפוס הטופס
          this.newDonor = { name: '', email: '', address: '', IsDeleted: false };
          // הערה: אם ה-Service שלך משתמש ב-tap וסיגנל פנימי, הרשימה תתעדכן לבד!
        },
        error: (err) => console.error('שגיאה בהוספת תורם', err)
      });
    }
  }
editingDonorId: number | null = null;

onEdit(donor: Donor) {
  this.editingDonorId = donor.id;
  this.newDonor = { ...donor }; // העתקת הנתונים לטופס
}

updateDonor() {
  if (this.editingDonorId) {
    this.donorService.updateDonor(this.editingDonorId, this.newDonor).subscribe({
      next: () => {
        alert('התורם עודכן!');
        this.editingDonorId = null;
        this.newDonor = { name: '', email: '', address: '', IsDeleted: false };
      }
    });
  }
}
  
  // פונקציה למחיקה
  onDelete(id: number) {
    if (confirm('האם את בטוחה שברצונך למחוק תורם זה?')) {
      this.donorService.deleteDonor(id).subscribe(() => {
        alert('התורם נמחק');
      });
    }
  }
}
