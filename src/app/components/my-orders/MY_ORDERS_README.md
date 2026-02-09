# MyOrders Component - Documentation

## 📋 סיכום

קומפוננטת Angular בשם `MyOrdersComponent` המציגה רשימת כל הרכישות של המשתמש המחובר בעזרת `OrderService`.

---

## 🎯 תכונות

✅ **קריאה ל-API** - מתאים ל-Endpoint `api/Order/user/history/{userId}`  
✅ **הצגת רכישות** - רשימת כרטיסי הזמנות עם פרטים מלאים  
✅ **סטטוס הזמנה** - הבחנה בין טיוטה (בעגלת קניות) לרכישה מאושרת  
✅ **פריטי הזמנה** - טבלה עם פרטי כל מתנה בהזמנה  
✅ **טעינה ושגיאות** - ניהול states של טעינה ודוא"ות שגיאה  
✅ **RTL Support** - ממשק בעברית מלאה  

---

## 📁 קבצים

### 1. my-orders.component.ts
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, AuthService } from '../../services';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    // ...
  }
}
```

**תכונות:**
- `orders` - רשימת ההזמנות המעוגלות מה-API
- `isLoading` - סימון בעת טעינה
- `errorMessage` - הודעת שגיאה אם יש בעיה

### 2. my-orders.component.html
```html
<div class="container">
  <h2>ההזמנות שלי</h2>
  
  <!-- טעינה -->
  <div *ngIf="isLoading" class="loading">...</div>
  
  <!-- שגיאה -->
  <div *ngIf="errorMessage" class="alert alert-danger">...</div>
  
  <!-- רשימת הזמנות -->
  <div *ngIf="!isLoading && !errorMessage">
    <div *ngFor="let order of orders" class="order-card card mb-3">
      <!-- פרטי הזמנה -->
    </div>
  </div>
</div>
```

### 3. my-orders.component.css
סטיילוג ל:
- כרטיסי הזמנות
- אנימציית טעינה
- טבלאות פריטים
- תגיות סטטוס

---

## 🔌 Integration עם OrderService

### הוספנו מתודה חדשה:

```typescript
/// <summary>קריאה ל-Endpoint ההיסטוריה של הזמנות משתמש</summary>
getUserOrderHistory(userId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/Order/user/history/${userId}`);
}
```

### השימוש בקומפוננטה:

```typescript
loadOrders(): void {
  // ... קבלת userId ...
  
  // קריאה ל-Endpoint ההיסטוריה של הזמנות
  this.orderService.getUserOrderHistory(userId).subscribe({
    next: (orders) => {
      this.orders = orders || [];
      this.isLoading = false;
    },
    error: (error) => {
      console.error('Error loading orders:', error);
      this.errorMessage = 'שגיאה בטעינת ההזמנות';
      this.isLoading = false;
    }
  });
}
```

---

## 📊 Data Structure

### Order Object
```typescript
{
  id: number;
  userId: number;
  orderDate: Date;
  totalAmount: number;
  isDraft: boolean;
  orderItems: OrderItem[];
}
```

### OrderItem Object
```typescript
{
  giftId: number;
  quantity: number;
  unitPrice: number;
}
```

---

## 🧪 בדיקה

### 1. ודא שה-Component קיים:
```bash
ls src/app/components/my-orders/
# my-orders.component.ts
# my-orders.component.html
# my-orders.component.css
```

### 2. ודא שמוגדר ב-Routes:
```typescript
// בתוך app.routes.ts
{
  path: 'my-orders',
  component: MyOrdersComponent
}
```

### 3. בדוק בדפדפן:
```
http://localhost:4200/my-orders
```

**Expected:**
- ✅ אם משתמש מחובר - רשימת ההזמנות שלו
- ✅ אם לא מחובר - הודעה "עליך להתחבר"
- ✅ אם אין הזמנות - הודעה "עדיין לא ביצעת הזמנות"

---

## 🎨 Styling

### States שמתוארים:

| State | Class | תיאור |
|-------|-------|---------|
| טעינה | `.loading` | ספינר + הודעה |
| שגיאה | `.alert alert-danger` | הודעת שגיאה + כפתור נסה שוב |
| טיוטה | `bg-warning` | תג צהוב |
| מאושרת | `bg-success` | תג ירוק |

---

## 📲 Component Usage

### הוספת ה-Component לעמוד:

```typescript
import { MyOrdersComponent } from './components/my-orders/my-orders.component';

// בתוך AppComponent או עמוד אחר:
<app-my-orders></app-my-orders>
```

### או דרך Routes:

```typescript
import { MyOrdersComponent } from './components/my-orders/my-orders.component';

export const routes: Routes = [
  {
    path: 'my-orders',
    component: MyOrdersComponent,
    canActivate: [authGuard] // אופציונלי: דרוש להיות מחובר
  }
];
```

---

## 🔐 Security

✅ **Authentication Check** - בדוק שמשתמש מחובר  
✅ **User ID** - משתמש לקריאה מהמידע של המשתמש המחובר  
✅ **Error Handling** - ניהול שגיאות ברור ובטוח  

---

## 🚀 Features שניתן להוסיף בעתיד

- [ ] Export להדפסה (PDF)
- [ ] Filtering וSorting
- [ ] Search בהזמנות
- [ ] Re-order button
- [ ] Order tracking
- [ ] Invoice download
- [ ] Order cancellation

---

## ✅ סטטוס

**קומפוננטה:** ✅ Implemented  
**OrderService:** ✅ Updated with `getUserOrderHistory`  
**Integration:** ✅ Ready  
**Testing:** ✅ Ready for manual testing

---

## 📝 Files Updated

| קובץ | שינוי |
|------|--------|
| `order.service.ts` | הוספת `getUserOrderHistory(userId)` |
| `my-orders.component.ts` | שימוש ב-`getUserOrderHistory` |

**סטטוס:** ✅ **COMPLETE**
