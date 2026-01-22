/**
 * פריט בהזמנה
 */
export interface OrderItem {
  giftId: number; // מזהה המתנה
  quantity: number; // כמות כרטיסים
}

/**
 * הזמנה
 */
export interface Order {
  id?: number; // מזהה ההזמנה (אוטומטי)
  userId: number; // מזהה המשתמש
  totalAmount: number; // סכום כולל
  isDraft: boolean; // האם זו טיוטה (סל קניות)
  orderDate?: Date; // תאריך ההזמנה
  orderItems: OrderItem[]; // פריטי ההזמנה
}

/**
 * בקשה ליצירת הזמנה חדשה
 */
export interface CreateOrderRequest {
  userId: number;
  giftId: number;
  quantity: number;
  isDraft: boolean;
}