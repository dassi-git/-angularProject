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
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.errorMessage = 'עליך להתחבר כדי לראות את ההזמנות שלך';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    let userId: number;
    if (user.id) {
      userId = user.id;
    } else if (user.email && !isNaN(parseInt(user.email))) {
      userId = parseInt(user.email);
    } else {
      userId = 1;
    }

    this.orderService.getUserOrders(userId).subscribe({
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

  getOrderDate(order: any): string {
    if (order.orderDate) {
      return new Date(order.orderDate).toLocaleDateString('he-IL');
    }
    return 'לא ידוע';
  }

  getOrderStatus(order: any): string {
    if (order.isDraft) {
      return 'טיוטה';
    }
    return 'מאושרת';
  }
}