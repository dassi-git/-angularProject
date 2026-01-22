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
// תפקידן: מנגנון הגנה (Validation)
// findByNumber(n): בודקת "האם כבר יש לנו מתנה עם המספר הזה?".
// findByName(name): בודקת "האם כבר יש לנו מתנה עם השם הזה?".
//בשמירה אנחנו משתמשים בשיטות האלו כדי לוודא שאין כפילויות. 
// זא שלא יהיו שתי מתנות עם אותו id
//  או אותו שם.
  private findByNumber(n: number) {
    return this.gifts().find(g => g.number === n);
  }

  private findByName(name: string) {
    return this.gifts().find(g => g.name === name);
  }

  startAdd() {
   
  //מכיוון שה-Signal error משמש להצגת הודעות אדומות בטופס (כמו "שדה חובה"),
  //  אנחנו רוצים לוודא שכשפותחים טופס חדש, הוא יהיה "נקי".
  //  השורה הזו מוחקת כל הודעת שגיאה שנשארה שם מהניסיון הקודם.
   this.error.set('');
   //זו השורה שמשפיעה ישירות על ה-HTML. כזכור, 
   // הטופס עטוף ב-*ngIf="editing()".
   //  ברגע שאנחנו משנים את ה-Signal הזה ל-true, 
   // הטופס "קופץ" ומופיע על המסך מול המשתמש.
    this.editing.set(true);
// התוצאה:איפוס הטופס  המשתמש יראה טופס ריק,
//  אבל בשדה של "עלות כרטיס" כבר יופיע המספר 10 כברירת מחדל
// //    כיון שהגדרנו את זה- כPartial<Gift> 
//  אפשר להגדיר רק חלק מהשדות,
 this.form.set({ ticketCost: 10 });
  }

  startEdit(g: Gift) {
    this.error.set('');
    this.editing.set(true);
    // העתקת הנתונים של המתנה הנבחרת אל הטופס
    this.form.set({ ...g });
  }

  save() {
    this.error.set('');
    const f = this.form();
    // validate required fields
    if (!f.number || !f.name || !f.donor || (f.ticketCost === undefined || f.ticketCost === null)) {
      this.error.set('כל השדות הינם חובה.');
      return;
    }
    const num = Number(f.number);
    const cost = Number(f.ticketCost);

    // when editing, allow same number/name for the same gift
    const existingByNumber = this.gifts().find(g => g.number === num && g.name !== f.name);
    // check for duplicates
    if (existingByNumber) {
      this.error.set('מספר המתנה כבר קיים במערכת.');
      return;
    }
    const existingByName = this.gifts().find(g => g.name === f.name && g.number !== num);
    if (existingByName) {
      this.error.set('שם המתנה כבר קיים במערכת.');
      return;
    }
//העתק של הרשימה 
    const gifts = [...this.gifts()];
    //  בדיקה האם המתנה שאני רוצה להוסיף כבר קיימת 
    //אם קיימת נחזיר את המיקום שלה
    const idx = gifts.findIndex(g => g.number === num || g.name === f.name);
    const gift: Gift = { number: num, name: String(f.name), donor: String(f.donor), ticketCost: cost };

    if (idx >= 0) {
  // אם מצאנו אינדקס (גדול מ-0), סימן שהמתנה קיימת - נעדכן אותה
      gifts[idx] = gift;
    } else {
      // אם האינדקס הוא 1-, סימן שזו מתנה חדשה - נוסיף אותה לסוף
      gifts.push(gift);
    }
//בשורה הזו אנחנו מעדכנים את ה-Signal הראשי של רשימת המתנות.

// מה קורה כאן: ה-Signal gifts מקבל את המערך החדש שיצרנו 
// (זה שבו או עדכנו מתנה קיימת או הוספנו חדשה).

// ההשפעה
//  על התצוגה: ברגע שהפקודה הזו מתבצעת, אנגולר מזהה שה-Signal השתנה.
//  מכיוון שהטבלה ב-HTML "מאזינה" לסיגנל הזה (באמצעות ה-*ngFor)
// , הטבלה מתעדכנת מיידית על המסך. 
// המשתמש יראה את המתנה החדשה ברשימה או את הפרטים המעודכנים של המתנה שערך.
    this.gifts.set(gifts);
    // סגירת הטופס וניקוי (this.cancel())
// במקום לכתוב 
// שוב את הקוד שסוגר את הטופס, 
// אנחנו פשוט קוראים לפונקציה cancel() שכבר קיימת במחלקה.
// מה הפונקציה עושה:

// הופכת את editing ל-false (מה שגורם לטופס להיעלם מהמסך).

// מאפסת את ה-Signal של ה-form לערכי ברירת המחדל.

// מנקה הודעות שגיאה אם היו כאלו
    this.cancel();
  }
//מחיקת מתנה
  delete(g: Gift) {
    this.gifts.set(this.gifts().filter(x => x !== g));
    // if currently editing this gift, cancel
    const f = this.form();
    if (f.number === g.number && f.name === g.name) this.cancel();
  }
//ביטול עריכה
  cancel() {
    this.editing.set(false);
    this.form.set({ ticketCost: 10 });
    this.error.set('');
  }
}
