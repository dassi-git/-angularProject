import { Routes } from '@angular/router';
import { AuthGuard } from './services';
import { AdminGuard } from './services/admin.guard';
import { Home } from './home/home';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { CatalogComponent } from './catalog/catalog';

export const routes: Routes = [
  { path: '', component: Home, pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'catalog', component: CatalogComponent },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart').then(m => m.Cart),
    canActivate: [AuthGuard]
  },
  {
    path: 'my-orders',
    loadComponent: () => import('./components/my-orders/my-orders.component').then(m => m.MyOrdersComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [AdminGuard],
    canActivateChild: [AdminGuard],
    children: [
      {
        path: 'donors',
        loadComponent: () => import('./components/donor/donor').then(m => m.DonorListComponent)
      },
      {
        path: 'manage-gifts',
        loadComponent: () => import('./components/gift-management/gift-management.component').then(m => m.GiftManagementComponent)
      },
      {
        path: 'raffles',
        loadComponent: () => import('./components/raffle-manage/raffle-manage').then(m => m.RaffleManage)
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/report-dashboard/report-dashboard').then(m => m.ReportDashboard)
      },
      {
        path: 'purchases',
        loadComponent: () => import('./components/purchases-report/purchases-report.component').then(m => m.PurchasesReportComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
