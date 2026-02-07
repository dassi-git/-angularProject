import { Gift } from "./gift.model";

export interface Ticket {
  id: number;
  giftId: number;
  userId: number;
  purchaseDate: Date;
  isUsed: boolean;
  Quantity: number;
  Gift:Gift;
}