import { Routes } from '@angular/router';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { GiftList } from './gift-list/gift-list';
import { GiftManagementComponent } from './components/gift-management/gift-management.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { AuthGuard } from './services';
import { DonorListComponent } from './components/donor/donor';
import { RaffleManage } from './components/raffle-manage/raffle-manage';
import { ReportDashboard } from './components/report-dashboard/report-dashboard';
import { Home } from './home/home';
import { CatalogComponent } from './catalog/catalog';


/**
 * הגדרות נתיבי האפליקציה
 * מגדיר אילו רכיבים יוצגו באילו נתיבים
 */
export const routes: Routes = [
    { path: '',component:Home, pathMatch: 'full'}, // דף הבית - פתוח לכולם
  { path: 'login', component: Login }, // דף כניסה - פתוח לכולם
  { path: 'register', component: Register }, // דף הרשמה - פתוח לכולם
  { path: 'catalog',  component:CatalogComponent }, // רשימת מתנות - פתוח לכולם
  // { path: 'my-orders', component: MyOrdersComponent, canActivate: [AuthGuard] }, // ההזמנות שלי - דורש אימות
  // { path: '', redirectTo: '', pathMatch: 'full' }, // נתיב ברירת מחדל - הפניה לרשימת 
  { 
    path: 'admin', 
    component: AdminDashboard, 
     canActivate: [AuthGuard],
    children: [
      { path: 'donors', component: DonorListComponent }, // /admin/donors
      {path: 'raffles',component:RaffleManage},
      {path:'reports',component:ReportDashboard},
      { path: 'manage-gifts', component: GiftManagementComponent  } // /admin/manage-gifts
    ]
  },
{ path: '**', redirectTo: '' }// נתיב ברירת מחדל למקרים של נתיב לא מוכר
];
