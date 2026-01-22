import { Routes } from '@angular/router';
import { Cart } from './components/cart/cart';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { GiftList } from './gift-list/gift-list';
import { GiftManagementComponent } from './components/gift-management/gift-management.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { AuthGuard } from './services';



/**
 * הגדרות נתיבי האפליקציה
 * מגדיר אילו רכיבים יוצגו באילו נתיבים
 */
export const routes: Routes = [
  { path: 'login', component: Login }, // דף כניסה - פתוח לכולם
  { path: 'register', component: Register }, // דף הרשמה - פתוח לכולם
  { path: 'gifts', component: GiftList, canActivate: [AuthGuard] }, // רשימת מתנות - דורש אימות
  { path: 'gift-management', component: GiftManagementComponent, canActivate: [AuthGuard] }, // ניהול מתנות - דורש אימות
  { path: 'cart', component: Cart, canActivate: [AuthGuard] }, // עגלת קניות - דורש אימות
  { path: 'my-orders', component: MyOrdersComponent, canActivate: [AuthGuard] }, // ההזמנות שלי - דורש אימות
  { path: 'admin', component: AdminDashboard, canActivate: [AuthGuard] }, // לוח בקרה מנהל - דורש אימות
  { path: '', redirectTo: '/gifts', pathMatch: 'full' } // נתיב ברירת מחדל - הפניה לרשימת מתנות
];
