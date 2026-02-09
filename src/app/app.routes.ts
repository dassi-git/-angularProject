import { Routes } from '@angular/router';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { GiftList } from './gift-list/gift-list';
import { GiftManagementComponent } from './components/gift-management/gift-management.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { AuthGuard } from './services';
import { AdminGuard } from './services/admin.guard';
import { DonorListComponent } from './components/donor/donor';
import { RaffleManage } from './components/raffle-manage/raffle-manage';
import { ReportDashboard } from './components/report-dashboard/report-dashboard';
import { PurchasesReportComponent } from './components/purchases-report/purchases-report.component';
import { Home } from './home/home';
import { CatalogComponent } from './catalog/catalog';
import { Cart } from './components/cart/cart';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'catalog', component: CatalogComponent },
  { path: 'cart', component: Cart, canActivate: [AuthGuard] },
  { 
    path: 'admin', 
    component: AdminDashboard, 
    canActivate: [AdminGuard],
    children: [
      { path: 'donors', component: DonorListComponent },
      { path: 'manage-gifts', component: GiftManagementComponent },
      { path: 'raffles', component: RaffleManage },
      { path: 'reports', component: ReportDashboard },
      { path: 'purchases', component: PurchasesReportComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
