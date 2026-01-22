export interface OrderItem {
  giftId: number;
  quantity: number;
}

export interface Order {
  userId: number;
  totalAmount: number;
  orderItems: OrderItem[];
}